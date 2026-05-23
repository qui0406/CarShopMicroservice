package com.tlaq.catalog_service.dto.response;

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
    int seatCapacity;
    String description;

    CarCategoryResponse category;
    CarBranchResponse carBranch;
}