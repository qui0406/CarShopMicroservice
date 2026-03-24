package com.tlaq.payment_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentResponse {
    String id;
    String orderId;
    BigDecimal totalAmount;
    BigDecimal paidAmount;
    BigDecimal remainAmount;
    String status; // PENDING, PARTIALLY_PAID, COMPLETED
    List<PaymentTransactionResponse> transactions;
}