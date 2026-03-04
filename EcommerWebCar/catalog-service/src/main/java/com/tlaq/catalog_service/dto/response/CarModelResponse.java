package com.tlaq.catalog_service.dto.response;

import com.tlaq.catalog_service.entity.enums.BodyType;
import com.tlaq.catalog_service.entity.enums.FuelType;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CarModelResponse {
    Long id;
    String name;

    CarCategoryResponse category;
    CarBranchResponse carBranch;

    int seatCapacity;
    BodyType bodyType;
    FuelType fuelType;
    String description;

    // CarCategoryResponse.java

    @Data
    @Builder
    public static class CarCategoryResponse {
        Long id;
        String name;
    }

    @Data
    @Builder
    public static class CarBranchResponse {
        Long id;
        String name;
        String imageBranch;
    }
}