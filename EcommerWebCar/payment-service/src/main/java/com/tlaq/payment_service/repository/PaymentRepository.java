package com.tlaq.payment_service.repository;

import com.tlaq.payment_service.entity.Payment;
import com.tlaq.payment_service.entity.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, String> {

    // Tìm thông tin thanh toán theo mã đơn hàng từ Ordering Service
    Optional<Payment> findByOrderId(String orderId);

    // Thống kê: Tìm các đơn hàng đã đặt cọc nhưng chưa trả hết tiền (Để staff gọi điện nhắc)
    List<Payment> findByStatus(PaymentStatus status);

    // Thống kê: Tính tổng số tiền showroom đã thu được (Doanh thu thực tế)
    @Query("SELECT SUM(p.paidAmount) FROM Payment p WHERE p.status != 'CANCELLED'")
    BigDecimal calculateTotalRevenue();
}