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
    String name;
    BigDecimal price;
    Long carModelId;
    String thumbnail;
    int manufacturingYear;

    boolean isUsed;
    int mileage;
    String vinNumber;
    String color;
    String showRoomId;
    String description;

    TechSpecRequest technicalSpec;
    EquipmentRequest equipment;
}
