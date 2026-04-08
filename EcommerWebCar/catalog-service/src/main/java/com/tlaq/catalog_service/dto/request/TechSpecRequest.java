package com.tlaq.catalog_service.dto.request;

import jakarta.validation.constraints.Min;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TechSpecRequest {
    String engine;
    String transmission;
    String fuelType;
    String bodyType;

    @Min(value = 0, message = "Công suất không được âm")
    BigDecimal horsepower;
    BigDecimal torque;

    String trimLevel;
    String engineSize;

    BigDecimal displacement;
    BigDecimal length;
    BigDecimal width;  // THÊM MỚI
    BigDecimal height; // THÊM MỚI
    BigDecimal groundClearance; // THÊM MỚI
    BigDecimal payload;
    BigDecimal fuelCapacity; // THÊM MỚI
    BigDecimal topSpeed;
}