package com.tlaq.payment_service.repository;

import com.tlaq.payment_service.entity.CashierPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CashPaymentRepository extends JpaRepository<CashierPayment, String> {

}
