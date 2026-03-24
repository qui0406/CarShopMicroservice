package com.tlaq.catalog_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TechSpecResponse {
    Long id;
    String engine;
    String transmission;
    String fuelType;
    BigDecimal horsepower;
    BigDecimal torque;
    BigDecimal displacement;
    BigDecimal length;
    BigDecimal payload;
    BigDecimal topSpeed;
}