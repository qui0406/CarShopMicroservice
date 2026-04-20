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

    int seatCapacity;
    String fuelType;
    String engineSize;

    BigDecimal price;
}
