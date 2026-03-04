package com.tlaq.catalog_service.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class InventoryRequest {
    @Min(value = 0, message = "Số lượng không được nhỏ hơn 0")
    int quantity;

    @NotBlank(message = "Vui lòng chọn xe để nhập kho")
    String carId;

    @NotBlank(message = "Vui lòng chọn Showroom")
    String showRoomId;
}