package com.tlaq.main_service.dto.responses;

import com.tlaq.main_service.entity.enums.PaymentStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderHistoryResponse {
    String orderId;
    String username;
    String fullName;
    String address;
    int quantity;
    BigDecimal totalAmount;
    PaymentStatus paymentStatus;
    BigDecimal depositAmount;
    LocalDateTime createdAt;
}
