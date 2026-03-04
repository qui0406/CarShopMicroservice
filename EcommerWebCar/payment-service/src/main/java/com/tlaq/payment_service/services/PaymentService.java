package com.tlaq.payment_service.services;

import com.tlaq.payment_service.dto.request.OfflinePaymentRequest;
import com.tlaq.payment_service.dto.request.PaymentRequest;
import com.tlaq.payment_service.dto.response.PaymentResponse;
import com.tlaq.payment_service.entity.Payment;
import com.tlaq.payment_service.entity.enums.TransactionType;

import java.math.BigDecimal;

public interface PaymentService {
    // 1. Khởi tạo bản ghi thanh toán khi đơn hàng vừa tạo (gọi qua RabbitMQ)
    void initializePayment(PaymentRequest request);

    // 2. Xử lý khi có giao dịch thành công (Online hoặc Offline)
    PaymentResponse updatePaymentProgress(Payment payment, BigDecimal newAmount);

    // 3. Nhân viên xác nhận thu tiền mặt/chuyển khoản tại showroom
    PaymentResponse confirmOfflinePayment(OfflinePaymentRequest request);

    // 4. Lấy thông tin để hiển thị Progress Bar và 3D Model
    PaymentResponse getPaymentStatusByOrder(String orderId);
}
