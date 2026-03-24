package com.tlaq.catalog_service.dto.request;

import com.tlaq.catalog_service.entity.enums.BodyType;
import com.tlaq.catalog_service.entity.enums.FuelType;
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
    @NotBlank(message = "Tên model không được để trống")
    String name;

    @NotNull(message = "Vui lòng chọn phân khúc xe")
    Long categoryId;

    @NotNull(message = "Vui lòng chọn hãng xe")
    Long carBranchId;

    @Min(value = 2, message = "Số chỗ ngồi tối thiểu là 2")
    int seatCapacity;

    BodyType bodyType;
    FuelType fuelType;
    String description;
}