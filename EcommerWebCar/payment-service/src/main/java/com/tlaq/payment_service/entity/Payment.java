package com.tlaq.payment_service.entity;

import com.tlaq.payment_service.entity.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
// Payment.java — bỏ PaymentDetails embedded, bỏ remainAmount
@Entity
@Table(name = "payment")
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(name = "order_id", unique = true, nullable = false)
    String orderId;

    @Column(precision = 19, scale = 2, nullable = false)
    BigDecimal totalAmount;  // Copy từ Orders.totalAmount khi tạo Payment (snapshot)

    @Column(precision = 19, scale = 2)
    BigDecimal paidAmount;   // Cập nhật mỗi khi có transaction thành công

    @Enumerated(EnumType.STRING)
    PaymentStatus status;

    @OneToMany(mappedBy = "payment", cascade = CascadeType.ALL, orphanRemoval = true)
    List<PaymentTransaction> transactions;

    @CreationTimestamp
    LocalDateTime createdAt;

    @UpdateTimestamp
    LocalDateTime updatedAt;

    // Computed getter — không persist xuống DB
    @Transient
    public BigDecimal getRemainAmount() {
        if (totalAmount == null) return BigDecimal.ZERO;
        BigDecimal paid = paidAmount != null ? paidAmount : BigDecimal.ZERO;
        return totalAmount.subtract(paid);
    }
}