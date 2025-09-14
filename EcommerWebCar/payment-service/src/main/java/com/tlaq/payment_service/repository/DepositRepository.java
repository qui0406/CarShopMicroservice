package com.tlaq.payment_service.repository;

import com.tlaq.payment_service.entity.Deposit;
import com.tlaq.payment_service.entity.enums.PaymentType;
import feign.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepositRepository extends JpaRepository<Deposit, String> {
    Optional<Deposit> findByOrderId(String s);

    List<Deposit> findByProfileId(String profileId);

    @Query("SELECT r FROM ReservePaymentVNPay r WHERE r.type <> :type")
    List<Deposit> findAllExcludePaymentTypeSuccess(@Param("type") PaymentType type);

}
