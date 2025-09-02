package com.tlaq.payment_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderHistoryResponse {
    String profileId;
    BigDecimal price;
    BigDecimal disposableAmount;
    BigDecimal remainAmount;
    String orderId;
    String transactionId;
    LocalDateTime createdAt;
}
