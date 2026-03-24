package com.tlaq.catalog_service.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CarRequest {
    // Thông tin cơ bản [cite: 2026-03-06, 2026-03-09]
    String name;
    BigDecimal price;
    Long carModelId;
    int manufacturingYear;

    // Tình trạng thực tế (Details) [cite: 2026-03-05, 2026-03-09]
    boolean isUsed;
    int mileage;
    String vinNumber;
    String color; // Màu sắc thực tế của xe [cite: 2026-03-09]

    // Hai nhóm thông số lồng nhau [cite: 2026-03-05, 2026-03-09]
    TechSpecRequest technicalSpec;
    EquipmentRequest equipment;
}
