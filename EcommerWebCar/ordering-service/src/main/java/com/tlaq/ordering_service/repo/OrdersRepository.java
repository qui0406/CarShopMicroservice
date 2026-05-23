package com.tlaq.ordering_service.repo;

import com.tlaq.ordering_service.entity.Orders;
import com.tlaq.ordering_service.entity.enums.OrdersStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrdersRepository extends JpaRepository<Orders, String>, JpaSpecificationExecutor<Orders> {

    @EntityGraph(attributePaths = {"orderItems"})
    Page<Orders> findByStatus(OrdersStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"orderItems"})
    @Override
    Page<Orders> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {"orderItems"})
    List<Orders> findByUserIdOrderByCreatedAtDesc(String userId);

    @EntityGraph(attributePaths = {"orderItems"})
    List<Orders> findByStatusInAndCreatedAtBetween(List<OrdersStatus> statuses, LocalDateTime start, LocalDateTime end);

    List<Orders> findByStatusAndTypeAndUpdatedAtBefore(OrdersStatus status, com.tlaq.ordering_service.entity.enums.OrdersType type, LocalDateTime time);

    boolean existsById(String id);
}