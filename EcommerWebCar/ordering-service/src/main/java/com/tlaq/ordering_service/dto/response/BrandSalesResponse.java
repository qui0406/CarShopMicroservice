package com.tlaq.ordering_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BrandSalesResponse {
    String brandName;
    long quantitySold;
    BigDecimal totalRevenue;
    String logoUrl;
}
