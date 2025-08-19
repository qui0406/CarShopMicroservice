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
public class DepositResponse {
    OrdersResponse orders;
    BigDecimal price;
    BigDecimal depositAmount;
    BigDecimal remainingAmount;
    String transactionId;
    LocalDateTime createdAt;
}
