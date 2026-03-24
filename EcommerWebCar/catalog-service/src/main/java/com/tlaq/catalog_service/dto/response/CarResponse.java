package com.tlaq.catalog_service.dto.response;

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

    // Tình trạng thực tế
    boolean isUsed;
    int mileage;
    String vinNumber;
    String color;
    String inspectionReportUrl;
    String model3dUrl;

    // Các thông tin chi tiết lồng nhau
    TechSpecResponse technicalSpec;
    EquipmentResponse equipment;

    // Danh sách ảnh xe
    List<String> images;

    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
