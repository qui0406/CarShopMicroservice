package com.tlaq.payment_service.services;

import com.tlaq.payment_service.dto.response.PageResponse;
import com.tlaq.payment_service.dto.response.PaymentDetailsResponse;
import com.tlaq.payment_service.dto.response.PaymentManagementResponse;
import com.tlaq.payment_service.entity.enums.PaymentStatus;

public interface PaymentManagementService {
    PageResponse<PaymentManagementResponse> getAllPaymentsForManagement(int page, int size, PaymentStatus status);
    
    PaymentDetailsResponse getPaymentDetails(String paymentId);
    void approveDeposit(String orderId);
}
