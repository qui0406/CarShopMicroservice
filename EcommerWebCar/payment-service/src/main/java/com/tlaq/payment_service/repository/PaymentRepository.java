package com.tlaq.payment_service.repository;

import com.tlaq.payment_service.entity.Payment;
import com.tlaq.payment_service.entity.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, String> {

    Optional<Payment> findByOrderId(String orderId);

    List<Payment> findByStatus(PaymentStatus status);

    @Query("SELECT SUM(p.paidAmount) FROM Payment p WHERE p.status != 'CANCELLED'")
    BigDecimal calculateTotalRevenue();

    Page<Payment> findByStatus(PaymentStatus status, Pageable pageable);
}