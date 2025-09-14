package com.tlaq.payment_service.dto.response;

import com.tlaq.payment_service.entity.enums.PaymentMethod;
import com.tlaq.payment_service.entity.enums.PaymentStatus;
import com.tlaq.payment_service.entity.enums.PaymentType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CashierNotDepositResponse {
    String id;
    String orderId;
    BigDecimal price;
    PaymentMethod paymentMethod;
    PaymentStatus status;
    LocalDateTime createdAt;
    String profileId;
    PaymentType type;
    String staffId;
}
