package com.tlaq.main_service.dto.responses;

import java.math.BigDecimal;

public interface MonthlyRevenueProjection {
    Integer getYear();
    Integer getMonth();
    Long getTotalOrders();
    BigDecimal getTotalRevenue();
}
