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
    String engine;        // Động cơ (Vd: 2.0L Turbo) [cite: 2026-03-09]
    String transmission;  // Hộp số (Vd: 9G-TRONIC) [cite: 2026-03-09]
    String fuelType;      // Loại nhiên liệu [cite: 2026-03-09]

    @Min(value = 0, message = "Công suất không được âm")
    BigDecimal horsepower; // Mã lực [cite: 2026-03-06, 2026-03-09]
    BigDecimal torque;     // Mô-men xoắn [cite: 2026-03-09]

    BigDecimal displacement; // Dung tích xi lanh [cite: 2026-03-09]
    BigDecimal length;       // Chiều dài [cite: 2026-03-09]
    BigDecimal payload;      // Tải trọng [cite: 2026-03-09]
    BigDecimal topSpeed;     // Tốc độ tối đa [cite: 2026-03-09]
}