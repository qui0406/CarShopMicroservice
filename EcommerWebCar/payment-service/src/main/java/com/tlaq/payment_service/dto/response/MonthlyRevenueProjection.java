package com.tlaq.payment_service.dto.response;

import java.math.BigDecimal;

public interface MonthlyRevenueProjection {
    Integer getYear();
    Integer getMonth();
    Long getTotalOrders();
    BigDecimal getTotalRevenue();
}
