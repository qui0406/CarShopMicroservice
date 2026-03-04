package com.tlaq.payment_service.controllers;

import com.tlaq.payment_service.dto.ApiResponse;
import com.tlaq.payment_service.dto.request.DepositRequest;
import com.tlaq.payment_service.dto.request.OfflinePaymentRequest;
import com.tlaq.payment_service.dto.response.PaymentResponse;
import com.tlaq.payment_service.dto.response.VNPayResponse;
import com.tlaq.payment_service.services.PaymentService;
import com.tlaq.payment_service.services.VNPayService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PaymentController {
    PaymentService paymentService;
    VNPayService vnPayService;

    @PostMapping("/vnpay-url")
    public ApiResponse<VNPayResponse> createDepositUrl(@RequestBody DepositRequest request, HttpServletRequest servletRequest) {
        String ipAddress = servletRequest.getRemoteAddr();
        var result = vnPayService.createDepositUrl(request.getPaymentId(), request.getAmount(), ipAddress);
        return ApiResponse.<VNPayResponse>builder().result(result).build();
    }

    @PostMapping("/confirm-offline")
    @PreAuthorize("hasRole('STAFF')")
    public ApiResponse<PaymentResponse> confirmOffline(@RequestBody OfflinePaymentRequest request) {
        var result = paymentService.confirmOfflinePayment(request);
        return ApiResponse.<PaymentResponse>builder().result(result).build();
    }

    @GetMapping("/status/{orderId}")
    public ApiResponse<PaymentResponse> getStatus(@PathVariable String orderId) {
        var result = paymentService.getPaymentStatusByOrder(orderId);
        return ApiResponse.<PaymentResponse>builder().result(result).build();
    }




}
