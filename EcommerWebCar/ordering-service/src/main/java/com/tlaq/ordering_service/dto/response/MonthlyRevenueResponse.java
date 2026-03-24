package com.tlaq.ordering_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class MonthlyRevenueResponse {
    int month;
    BigDecimal totalRevenue;
}