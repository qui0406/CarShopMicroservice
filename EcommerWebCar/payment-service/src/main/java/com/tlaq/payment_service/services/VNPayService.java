package com.tlaq.payment_service.services;

import com.tlaq.payment_service.dto.response.VNPayResponse;
import com.tlaq.payment_service.entity.enums.TransactionType;

import java.math.BigDecimal;
import java.util.Map;

public interface VNPayService {
    // Tạo link thanh toán VNPAY (cọc xe)
    VNPayResponse createPaymentUrl(String orderId, BigDecimal amount, String ipAddress, TransactionType type);
    // Xử lý IPN (Instant Payment Notification) từ VNPAY gửi về
    void processVnpayCallback(Map<String, String> vnpParams);
}