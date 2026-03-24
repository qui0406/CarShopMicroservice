package com.tlaq.ordering_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CarResponse {
    String id;
    String name;
    BigDecimal price;
    int manufacturingYear;
    int mileage;
    String vinNumber;
    String color;
    String inspectionReportUrl;
    String model3dUrl;

    // Các Object lồng nhau [cite: 2026-03-11]
    TechnicalSpecResponse technicalSpec;
    EquipmentResponse equipment;

    List<String> images;

    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    boolean used;
}