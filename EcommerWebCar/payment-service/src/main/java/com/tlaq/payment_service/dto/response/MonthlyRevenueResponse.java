package com.tlaq.payment_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MonthlyRevenueResponse {
    Integer year;
    Integer month;
    Long totalOrders;
    BigDecimal totalRevenue;
}
