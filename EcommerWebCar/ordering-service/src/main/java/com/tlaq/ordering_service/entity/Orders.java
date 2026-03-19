package com.tlaq.ordering_service.entity;


import com.tlaq.ordering_service.entity.enums.OrdersStatus;
import com.tlaq.ordering_service.entity.enums.OrdersType;
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
@Table(name = "orders")
public class Orders {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    String userId;

    @Enumerated(EnumType.STRING)
    OrdersStatus status;

    @Enumerated(EnumType.STRING)
    OrdersType type;

    BigDecimal baseAmount;
    BigDecimal taxAmount;
    BigDecimal plateFeeAmount;
    BigDecimal insuranceAmount;
    BigDecimal totalAmount; // = base + tax + plate + insurance, tính khi tạo order

    @Column(columnDefinition = "TEXT")
    String note;

    @CreationTimestamp
    @Column(updatable = false)
    LocalDateTime createdAt;

    @UpdateTimestamp
    LocalDateTime updatedAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    List<OrdersDetails> orderItems;
}