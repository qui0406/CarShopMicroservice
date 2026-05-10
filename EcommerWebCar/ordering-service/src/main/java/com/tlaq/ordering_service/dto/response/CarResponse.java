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
    String fuelType;
    int mileage;
    String vinNumber;
    String color;
    String inspectionReportUrl;
    String model3dUrl;
    List<String> imageUrls;
    boolean isUsed;
}