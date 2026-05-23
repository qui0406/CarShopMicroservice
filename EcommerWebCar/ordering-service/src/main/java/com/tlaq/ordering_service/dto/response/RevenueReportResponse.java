package com.tlaq.ordering_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RevenueReportResponse {
    String label; // e.g., "Tháng 01" or "Ngày 17"
    long totalOrders;
    BigDecimal totalRevenue;
}
