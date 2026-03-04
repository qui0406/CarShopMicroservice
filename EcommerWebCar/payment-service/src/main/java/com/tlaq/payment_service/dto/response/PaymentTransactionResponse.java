package com.tlaq.payment_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentTransactionResponse {
    String id;
    String type;   // DEPOSIT, BALANCE, FULL_PAYMENT
    String method; // VNPAY, CASH, BANK_TRANSFER
    BigDecimal amount;
    String status; // SUCCESS, FAILED
    LocalDateTime createdAt;
    String note;
}