package com.tlaq.payment_service.repository;

import com.tlaq.payment_service.entity.ReservePaymentVNPay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReserveVNPayRepository extends JpaRepository<ReservePaymentVNPay, String> {
    Optional<ReservePaymentVNPay> findByOrderId(String s);

    List<ReservePaymentVNPay> findByProfileId(String profileId);
}
