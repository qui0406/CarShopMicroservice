package com.tlaq.payment_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CarResponse {
    String id;
    String name;
    String thumbnail;
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
    CarModelResponse carModel;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class CarModelResponse {
        Long id;
        String name;
        CarBranchResponse carBranch;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class CarBranchResponse {
        Long id;
        String name;
        String country;
        String imageBranch;
    }
}