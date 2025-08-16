package com.tlaq.dto.response;

import com.tlaq.entity.enums.PaymentStatus;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.context.annotation.Profile;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrdersResponse {
    String orderId;
    String userId;
    BigDecimal totalAmount;
    @Enumerated(EnumType.STRING)
    PaymentStatus paymentStatus;
}
