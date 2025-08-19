package com.tlaq.payment_service.dto.response;

import com.tlaq.payment_service.entity.enums.PaymentStatus;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrdersResponse {
    String id;
    Profile profile;
    @Enumerated(EnumType.STRING)
    PaymentStatus paymentStatus;

    OrderDetails orderDetails;

    @Data
    @RequiredArgsConstructor
    public static class OrderDetails {
        private BigDecimal totalAmount;
        private int quantity;
    }
}
