package com.tlaq.payment_service.entity;

import com.tlaq.payment_service.entity.enums.PaymentMethod;
import com.tlaq.payment_service.entity.enums.PaymentStatus;
import com.tlaq.payment_service.entity.enums.PaymentType;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Entity
@SuperBuilder
@Data
@Table(name = "deposit")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Deposit {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(name ="order_id")
    String orderId;

    BigDecimal price;

    @Column(name = "method_payment")
    @Enumerated(EnumType.STRING)
    PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    PaymentStatus status;

    @CreationTimestamp
    @Column(name = "created_at")
    LocalDateTime createdAt;

    @Column(name = "profile_id")
    String profileId;

    @Enumerated(EnumType.STRING)
    PaymentType type;

    @Column(name = "transaction_id")
    String transactionVNPayId;

    @Column(name = "disposit_amount")
    BigDecimal depositAmount;

    @Column(name ="remaining_amount")
    BigDecimal remainingAmount;
}
