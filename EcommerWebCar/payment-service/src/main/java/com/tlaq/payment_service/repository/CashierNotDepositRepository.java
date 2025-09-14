package com.tlaq.payment_service.repository;

import com.tlaq.payment_service.entity.CashierNotDeposit;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CashierNotDepositRepository extends JpaRepository<CashierNotDeposit, String> {
}
