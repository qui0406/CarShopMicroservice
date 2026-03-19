package com.tlaq.payment_service.entity;

import com.tlaq.payment_service.entity.enums.PaymentMethod;
import com.tlaq.payment_service.entity.enums.TransactionStatus;
import com.tlaq.payment_service.entity.enums.TransactionType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "payment_transactions",
        indexes = @Index(name = "idx_txn_ref", columnList = "txn_ref")) // ← THÊM index
public class PaymentTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id", nullable = false)
    Payment payment;

    @Enumerated(EnumType.STRING)
    TransactionType type;

    @Enumerated(EnumType.STRING)
    PaymentMethod method;

    @Column(precision = 19, scale = 2, nullable = false)
    BigDecimal amount;

    @Column(name = "txn_ref") // ← đổi tên nhất quán
    String txnRef;

    @Column(name = "vnp_transaction_no")
    String vnpTransactionNo;

    @Enumerated(EnumType.STRING)
    TransactionStatus status;

    String staffId;
    String note;

    @CreationTimestamp
    LocalDateTime createdAt;
}