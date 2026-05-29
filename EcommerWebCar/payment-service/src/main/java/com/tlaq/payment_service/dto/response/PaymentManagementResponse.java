package com.tlaq.payment_service.dto.response;

import com.tlaq.payment_service.entity.enums.PaymentStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentManagementResponse {
    String id;
    String orderId;
    String customerName;
    String carName;
    String address;
    String phone;
    BigDecimal totalAmount;
    BigDecimal paidAmount;
    PaymentStatus status;
    LocalDateTime createdAt;
}
