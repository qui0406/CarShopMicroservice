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
    CarModelResponse carModel;

    String name;

    String vinNumber;
    String color;
    BigDecimal price;
    int manufacturingYear;

    // Dành cho xe cũ
    boolean isUsed;
    int mileage;
    String inspectionReportUrl;

    String model3dUrl;
    List<String> imageUrls;

    LocalDateTime updatedAt;
}
