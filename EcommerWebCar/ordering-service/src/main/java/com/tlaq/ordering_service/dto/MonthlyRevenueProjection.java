package com.tlaq.ordering_service.dto;

import java.math.BigDecimal;

public interface MonthlyRevenueProjection {
    Integer getYear();
    Integer getMonth();
    Long getTotalOrders();
    BigDecimal getTotalRevenue();
}
