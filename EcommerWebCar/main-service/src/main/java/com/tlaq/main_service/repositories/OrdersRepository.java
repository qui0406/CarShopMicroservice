package com.tlaq.main_service.repositories;

import com.tlaq.main_service.entity.Orders;
import com.tlaq.main_service.entity.enums.PaymentStatus;
import com.tlaq.main_service.entity.enums.RoleCreateOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrdersRepository extends JpaRepository<Orders, String> {
    List<Orders> findByProfileId(String profileId);
    List<Orders> findByProfileIdAndPaymentStatus(String profileId, PaymentStatus paymentStatus);
    List<Orders> findByRoleCreateOrder(RoleCreateOrder roleCreateOrder);
}
