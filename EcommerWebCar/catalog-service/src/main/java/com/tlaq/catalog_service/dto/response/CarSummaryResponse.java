package com.tlaq.catalog_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CarSummaryResponse {
    String id;
    String name;
    String thumbnail;

    int seatCapacity;    // 5 CHỖ
    String fuelType;     // XĂNG
    String engineSize;   // 1.8L

    BigDecimal price;    // 1.250.000.000
}
