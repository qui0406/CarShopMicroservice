package com.tlaq.catalog_service.dto.request;

import com.tlaq.catalog_service.entity.enums.BodyType;
import com.tlaq.catalog_service.entity.enums.FuelType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CarModelRequest {
    @NotBlank(message = "MODEL_NAME_REQUIRED")
    String name;

    @NotNull(message = "BRANCH_ID_REQUIRED")
    Long carBranchId;

    @NotNull(message = "CATEGORY_ID_REQUIRED")
    Long categoryId;

    int seatCapacity;
    String description;
    String thumbnailImage;

    @Valid
    TechSpecRequest technicalSpec;

    @Valid
    EquipmentRequest equipment;
}