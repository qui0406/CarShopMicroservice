package com.tlaq.payment_service.controllers;

import com.tlaq.payment_service.dto.ApiResponse;
import com.tlaq.payment_service.services.VNPayService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/payments/vnpay-callback")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class VNPayCallbackController {
    VNPayService vnPayService;

    @GetMapping
    public ApiResponse<String> handleVnpayReturn(HttpServletRequest request) {
        // Parse raw query string, giữ nguyên encoded values
        Map<String, String> vnpParams = new HashMap<>();
        String queryString = request.getQueryString();

        if (queryString != null) {
            for (String pair : queryString.split("&")) {
                int idx = pair.indexOf("=");
                if (idx > 0) {
                    String key = pair.substring(0, idx);
                    String value = pair.substring(idx + 1); // KHÔNG decode
                    vnpParams.put(key, value);
                }
            }
        }

        vnPayService.processVnpayCallback(vnpParams);

        String responseCode = vnpParams.get("vnp_ResponseCode");
        if ("00".equals(responseCode)) {
            return ApiResponse.<String>builder().result("Thanh toán cọc thành công! Chúc mừng bạn.").build();
        }
        return ApiResponse.<String>builder().result("Giao dịch thất bại hoặc đã bị hủy.").build();
    }
}