package com.tlaq.payment_service.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OfflinePaymentRequest {
    String paymentId;
    BigDecimal amount;
    String method; // CASH, BANK_TRANSFER
    String note;
    String staffId; // Nhân viên thực hiện thu tiền
}