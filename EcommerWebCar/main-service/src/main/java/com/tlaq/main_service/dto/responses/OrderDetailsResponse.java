package com.tlaq.main_service.dto.responses;

import com.tlaq.main_service.entity.enums.PaymentStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderDetailsResponse {
    String orderId;
    String username;
    String fullName;
    String address;
    int quantity;
    BigDecimal totalAmount;
    PaymentStatus paymentStatus;
}
