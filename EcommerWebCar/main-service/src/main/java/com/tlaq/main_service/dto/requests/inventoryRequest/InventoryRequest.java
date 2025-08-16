package com.tlaq.main_service.dto.requests.inventoryRequest;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class InventoryRequest {
    @NotBlank
    String carId;

    @Min(value = 1, message = "Số lượng tối thiểu là 1")
    @Max(value = 100, message = "Số lượng tối đa là 100")
    int quantity;
}
