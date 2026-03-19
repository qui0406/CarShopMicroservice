package com.tlaq.payment_service.dto.request;

import com.tlaq.payment_service.entity.enums.PaymentMethod;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OfflinePaymentRequest {
    @NotBlank(message = "ORDER_ID_REQUIRED")
    String orderId;

    @NotNull(message = "AMOUNT_REQUIRED")
    @DecimalMin(value = "0.1", message = "INVALID_AMOUNT")
    BigDecimal amount;

    @NotNull(message = "METHOD_REQUIRED")
    PaymentMethod method;

    String staffId;
    String note;
}