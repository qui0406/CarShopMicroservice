package com.tlaq.payment_service.services;

import com.tlaq.payment_service.dto.response.VNPayResponse;

import java.util.Map;

public interface VNPayService {
    // Tạo link thanh toán VNPAY (cọc xe)
    VNPayResponse createDepositUrl(String paymentId, long amount, String ipAddress);

    // Xử lý IPN (Instant Payment Notification) từ VNPAY gửi về
    void processVnpayCallback(Map<String, String> vnpParams);
}