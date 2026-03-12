package com.tlaq.ordering_service.repo;

import com.tlaq.ordering_service.dto.response.MonthlyRevenueResponse;
import com.tlaq.ordering_service.entity.Orders;
import com.tlaq.ordering_service.entity.enums.OrdersStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
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

    @Query("SELECT SUM(o.totalAmount) FROM Orders o " +
            "WHERE o.status = :status " +
            "AND o.createdAt BETWEEN :start AND :end")
    BigDecimal calculateTotalRevenue(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("status") OrdersStatus status
    );

    @Query("SELECT new com.tlaq.ordering_service.dto.response.MonthlyRevenueResponse(" +
            "MONTH(o.createdAt), SUM(o.totalAmount)) " +
            "FROM Orders o " +
            "WHERE YEAR(o.createdAt) = :year " +
            "AND o.status = 'COMPLETED' " +
            "GROUP BY MONTH(o.createdAt) " +
            "ORDER BY MONTH(o.createdAt) ASC")
    List<MonthlyRevenueResponse> getMonthlyRevenue(@Param("year") int year, @Param("status") OrdersStatus status);

    long countByUserIdAndStatus(String userId, OrdersStatus status);
}