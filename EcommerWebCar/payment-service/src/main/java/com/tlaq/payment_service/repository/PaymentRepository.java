package com.tlaq.payment_service.repository;

import com.tlaq.payment_service.entity.Payment;
import com.tlaq.payment_service.entity.enums.PaymentStatus;
import feign.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, String> {
    boolean existsByOrderId(String orderId);

    @Query("SELECT p.status FROM Payment p WHERE p.orderId = :orderId")
    PaymentStatus getPaymentStatusByOrderId(@Param("orderId") String orderId);


}
