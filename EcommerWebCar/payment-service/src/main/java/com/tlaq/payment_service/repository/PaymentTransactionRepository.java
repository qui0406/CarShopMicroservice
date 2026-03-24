package com.tlaq.payment_service.repository;

import com.tlaq.payment_service.entity.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, String> {

    // Lấy lịch sử giao dịch của một đơn thanh toán cụ thể (Sắp xếp mới nhất lên đầu)
    List<PaymentTransaction> findByPaymentIdOrderByCreatedAtDesc(String paymentId);

    // Tìm giao dịch theo mã tham chiếu VNPAY (Để đối soát khi VNPAY gọi Callback)
    Optional<PaymentTransaction> findByTxnRef(String txnRef);

    // Thống kê: Tìm các giao dịch do một nhân viên cụ thể xác nhận (Kiểm tra doanh số Staff)
    List<PaymentTransaction> findByStaffId(String staffId);

    // Thống kê: Tính tổng tiền thu được theo phương thức (VNPAY vs Tiền mặt)
    @Query("SELECT pt.method, SUM(pt.amount) FROM PaymentTransaction pt " +
            "WHERE pt.status = 'SUCCESS' GROUP BY pt.method")
    List<Object[]> countRevenueByMethod();
}