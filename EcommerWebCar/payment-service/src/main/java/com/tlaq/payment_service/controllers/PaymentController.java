package com.tlaq.payment_service.controllers;

import com.tlaq.payment_service.dto.ApiResponse;
import com.tlaq.payment_service.dto.request.ConfirmPaymentRequest;
import com.tlaq.payment_service.dto.request.DepositRequest;
import com.tlaq.payment_service.dto.request.OfflinePaymentRequest;
import com.tlaq.payment_service.dto.response.PaymentResponse;
import com.tlaq.payment_service.dto.response.VNPayResponse;
import com.tlaq.payment_service.entity.enums.PaymentMethod;
import com.tlaq.payment_service.entity.enums.TransactionType;
import com.tlaq.payment_service.services.PaymentService;
import com.tlaq.payment_service.services.VNPayService;
import com.tlaq.payment_service.utils.VNPayUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PaymentController {
    PaymentService paymentService;
    VNPayService vnPayService;

    @PostMapping("/create-vnpay-url")
    public ApiResponse<VNPayResponse> createUrl(
            @RequestParam String orderId,
            @RequestParam BigDecimal amount,
            @RequestParam TransactionType type,
            HttpServletRequest request) {

        String ipAddress = VNPayUtils.getIpAddress(request);
        return ApiResponse.<VNPayResponse>builder()
                .result(vnPayService.createPaymentUrl(orderId, amount, ipAddress, type))
                .build();
    }

    @PostMapping("/staff/confirm-offline")
    @PreAuthorize("hasRole('STAFF')")
    public ApiResponse<PaymentResponse> confirmOffline(@RequestBody ConfirmPaymentRequest request) {
        var result = paymentService.confirmOfflinePayment(request);
        return ApiResponse.<PaymentResponse>builder().result(result).build();
    }

    @PreAuthorize("hasRole('STAFF')")
    @PostMapping("/staff/create-payment")
    public ApiResponse<PaymentResponse> createPayment(@RequestBody OfflinePaymentRequest request) {
        return ApiResponse.<PaymentResponse>builder()
                .result(paymentService.fullPayment(request))
                .build();
    }

    @GetMapping("/status/{orderId}")
    public ApiResponse<PaymentResponse> getStatus(@PathVariable String orderId) {
        var result = paymentService.getPaymentStatusByOrder(orderId);
        return ApiResponse.<PaymentResponse>builder().result(result).build();
    }
}
