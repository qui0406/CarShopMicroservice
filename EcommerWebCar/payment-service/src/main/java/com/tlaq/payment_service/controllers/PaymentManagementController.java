package com.tlaq.payment_service.controllers;

import com.tlaq.payment_service.dto.ApiResponse;
import com.tlaq.payment_service.dto.request.ConfirmPaymentRequest;
import com.tlaq.payment_service.dto.request.OfflinePaymentRequest;
import com.tlaq.payment_service.dto.response.PageResponse;
import com.tlaq.payment_service.dto.response.PaymentManagementResponse;
import com.tlaq.payment_service.dto.response.PaymentResponse;
import com.tlaq.payment_service.entity.enums.PaymentStatus;
import com.tlaq.payment_service.services.PaymentManagementService;
import com.tlaq.payment_service.services.PaymentService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/payments/staff")
@RequiredArgsConstructor
@PreAuthorize("hasRole('STAFF')")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PaymentManagementController {
    PaymentManagementService paymentManagementService;
    PaymentService paymentService;

    @GetMapping("all-payments")
    public ApiResponse<PageResponse<PaymentManagementResponse>> getManagementPayments(
            @RequestParam(value = "page", required = false, defaultValue = "1") int page,
            @RequestParam(value = "size", required = false, defaultValue = "10") int size,
            @RequestParam(value = "status", required = false, defaultValue = "PARTIALLY_PAID") PaymentStatus status
    ) {
        return ApiResponse.<com.tlaq.payment_service.dto.response.PageResponse<com.tlaq.payment_service.dto.response.PaymentManagementResponse>>builder()
                .result(paymentManagementService.getAllPaymentsForManagement(page, size, status))
                .build();
    }

    @PostMapping("/confirm-offline")
    public ApiResponse<PaymentResponse> confirmOffline(@RequestBody ConfirmPaymentRequest request) {
        var result = paymentService.confirmOfflinePayment(request);
        return ApiResponse.<PaymentResponse>builder().result(result).build();
    }

    @PostMapping("/create-payment")
    public ApiResponse<PaymentResponse> createPayment(@RequestBody OfflinePaymentRequest request) {
        return ApiResponse.<PaymentResponse>builder()
                .result(paymentService.fullPayment(request))
                .build();
    }
}
