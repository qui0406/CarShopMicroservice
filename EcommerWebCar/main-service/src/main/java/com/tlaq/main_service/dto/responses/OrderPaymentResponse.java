package com.tlaq.main_service.dto.responses;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderPaymentResponse {
    String profileId;
    BigDecimal price;
    BigDecimal disposableAmount;
    BigDecimal remainAmount;
    String orderId;
    String transactionId;
    LocalDateTime createdAt;
}
