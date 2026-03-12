package com.tlaq.ordering_service.repo;

import com.tlaq.ordering_service.entity.OrdersHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrdersHistoryRepository extends JpaRepository<OrdersHistory, Long> {
    List<OrdersHistory> findByOrderIdOrderByCreatedAtAsc(String orderId);
}