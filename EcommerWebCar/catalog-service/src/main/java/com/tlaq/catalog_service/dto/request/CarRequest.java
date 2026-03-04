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

    boolean isUsed;
    int mileage;
    int manufacturingYear;
    String vinNumber;

    String inspectionReportUrl;
    String model3dUrl;

    Long specificationId;
    Long serviceId;
}
