package com.tlaq.payment_service.repository;

import com.tlaq.payment_service.dto.response.MonthlyRevenueProjection;
import com.tlaq.payment_service.entity.CashierNotDeposit;
import feign.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;


public interface CashierNotDepositRepository extends JpaRepository<CashierNotDeposit, String> {
    @Query(value = """
        SELECT 
            YEAR(c.created_at) AS year,
            MONTH(c.created_at) AS month,
            COUNT(c.id) AS totalOrders,
            SUM(c.price) AS totalRevenue
        FROM cashier_not_deposit c
        WHERE c.status = 'SUCCESS'
        GROUP BY YEAR(c.created_at), MONTH(c.created_at)
        ORDER BY year, month
        """, nativeQuery = true)
    List<MonthlyRevenueProjection> getMonthlyRevenue();


    @Query(value = """
        SELECT 
            YEAR(c.created_at) AS year,
            MONTH(c.created_at) AS month,
            COUNT(c.id) AS totalOrders,
            SUM(c.price) AS totalRevenue
        FROM cashier_not_deposit c
        WHERE c.status = 'SUCCESS'
          AND YEAR(c.created_at) = :year
          AND MONTH(c.created_at) = :month
        GROUP BY YEAR(c.created_at), MONTH(c.created_at)
        """, nativeQuery = true)
    MonthlyRevenueProjection getMonthlyRevenueByMonth(@Param("year") int year, @Param("month") int month);

}
