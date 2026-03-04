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
@Entity
@Table(name = "payment")
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(name = "order_id", unique = true, nullable = false)
    String orderId; // Link tới đơn hàng bên Ordering Service

    @Column(precision = 19, scale = 2)
    BigDecimal totalAmount; // Tổng giá trị chiếc xe

    @Column(precision = 19, scale = 2)
    BigDecimal paidAmount;  // Số tiền khách đã trả (cộng dồn các Transaction)

    @Column(precision = 19, scale = 2)
    BigDecimal remainAmount; // Số tiền còn thiếu (Total - Paid)

    @Enumerated(EnumType.STRING)
    PaymentStatus status; // PENDING, PARTIALLY_PAID (đã cọc), COMPLETED (mua đứt), CANCELLED

    @OneToMany(mappedBy = "payment", cascade = CascadeType.ALL)
    List<PaymentTransaction> transactions; // Lịch sử các lần nộp tiền

    @CreationTimestamp
    LocalDateTime createdAt;

    @UpdateTimestamp
    LocalDateTime updatedAt;
}