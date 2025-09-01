package com.tlaq.main_service.dto.requests;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrdersRequest {
    String id;

    @NotBlank
    String carId;
    BigDecimal unitPrice;

    @Min(1)
    @Max(100)
    int quantity;

    OrderDetailsRequest orderDetailsRequest;
}
