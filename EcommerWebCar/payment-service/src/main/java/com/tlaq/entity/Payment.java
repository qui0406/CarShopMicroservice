package com.tlaq.entity;

import com.tlaq.entity.enums.MethodPayment;
import com.tlaq.entity.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "payment")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(name ="order_id")
    String orderId;

    @Column(name = "transaction_id")
    String transactionId;

    BigDecimal price;

    @Column(name = "method_payment")
    @Enumerated(EnumType.STRING)
    MethodPayment methodPayment;

    @Enumerated(EnumType.STRING)
    PaymentStatus status;

    @Column(name = "created_at")
    LocalDateTime createdAt;
}
