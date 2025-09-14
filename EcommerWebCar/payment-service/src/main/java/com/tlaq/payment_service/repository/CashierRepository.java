package com.tlaq.payment_service.repository;

import com.tlaq.payment_service.entity.Cashier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CashierRepository extends JpaRepository<Cashier, String> {
    Optional<Cashier> findByOrderId(String orderId);
}
