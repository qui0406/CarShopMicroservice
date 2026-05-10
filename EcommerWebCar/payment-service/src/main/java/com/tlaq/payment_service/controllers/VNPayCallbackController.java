package com.tlaq.payment_service.controllers;

import com.tlaq.payment_service.services.VNPayService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import com.tlaq.payment_service.repository.PaymentTransactionRepository;
import com.tlaq.payment_service.entity.PaymentTransaction;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class VNPayCallbackController {
    VNPayService vnPayService;
    PaymentTransactionRepository transactionRepository;

    @Value("${frontend.url:http://localhost:3000}")
    String frontendUrl;

    @GetMapping("/vnpay-callback")
    public void handleVnpayReturn(HttpServletRequest request, HttpServletResponse response) throws IOException {
        Map<String, String> vnpParams = getVnpParams(request);

        try {
            vnPayService.processVnpayCallback(vnpParams);
        } catch (Exception e) {
            // Log lỗi nếu cần, nhưng vẫn tiếp tục để redirect về frontend báo lỗi
        }

        String responseCode = vnpParams.get("vnp_ResponseCode");
        String txnRef = vnpParams.get("vnp_TxnRef");
        String orderId = "";
        
        try {
            PaymentTransaction transaction = transactionRepository.findByTxnRef(txnRef).orElse(null);
            if (transaction != null && transaction.getPayment() != null) {
                orderId = transaction.getPayment().getOrderId();
            }
        } catch (Exception e) {
            // Ignore error
        }

        String queryString = request.getQueryString();
        String redirectUrl;

        if ("00".equals(responseCode)) {
            redirectUrl = frontendUrl + "/payment-result?status=success&orderId=" + orderId + "&" + queryString;
        } else {
            redirectUrl = frontendUrl + "/payment-result?status=failed&orderId=" + orderId + "&" + queryString;
        }

        response.sendRedirect(redirectUrl);
    }

    // 2. IPN URL: Endpoint dành riêng cho server của VNPay gọi sang (Server-to-Server)
    @GetMapping("/vnpay-ipn")
    public ResponseEntity<Map<String, String>> handleVnpayIpn(HttpServletRequest request) {
        Map<String, String> vnpParams = getVnpParams(request);
        Map<String, String> response = new HashMap<>();

        try {
            vnPayService.processVnpayCallback(vnpParams);
            response.put("RspCode", "00");
            response.put("Message", "Confirm Success");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            // Trả về 99 (Unknow Error) hoặc các mã lỗi khác theo chuẩn VNPay
            response.put("RspCode", "99");
            response.put("Message", "Unknown error: " + e.getMessage());
            return ResponseEntity.ok(response);
        }
    }

    private Map<String, String> getVnpParams(HttpServletRequest request) {
        Map<String, String> vnpParams = new HashMap<>();
        String queryString = request.getQueryString();

        if (queryString != null) {
            for (String pair : queryString.split("&")) {
                int idx = pair.indexOf("=");
                if (idx > 0) {
                    String key = pair.substring(0, idx);
                    String value = pair.substring(idx + 1); // KHÔNG decode để giữ nguyên chữ ký
                    vnpParams.put(key, value);
                }
            }
        }
        return vnpParams;
    }
}