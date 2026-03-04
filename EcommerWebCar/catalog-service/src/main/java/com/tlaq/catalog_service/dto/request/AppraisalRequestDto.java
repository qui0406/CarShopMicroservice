package com.tlaq.catalog_service.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AppraisalRequestDto {
    @NotNull(message = "Hãng xe không được để trống")
    Long branchId;

    @NotNull(message = "Dòng xe không được để trống")
    Long modelId;

    @Min(value = 1900)
    Integer manufacturingYear;

    @Min(value = 0)
    Integer mileage; // Số KM thực tế

    String conditionNote; // Mô tả tình trạng (trầy xước, máy móc...)

    @Positive
    BigDecimal expectedPrice; // Giá khách mong muốn
}
