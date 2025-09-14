package com.tlaq.payment_service.dto.response;

import com.tlaq.payment_service.entity.enums.PaymentMethod;
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
    String orderId;
    String fullName;
    PaymentMethod paymentMethod;
    BigDecimal price;
    BigDecimal depositAmount;
    BigDecimal remainingAmount;
    String transactionId;
    LocalDateTime createdAt;
}
