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
    String trimLevel;
    String engineSize;
    String engine;
    String transmission;
    String bodyType;
    BigDecimal horsepower;
    BigDecimal torque;
    BigDecimal topSpeed;
    BigDecimal length;
    BigDecimal width;
    BigDecimal height;
    BigDecimal groundClearance;
    BigDecimal fuelCapacity;
}