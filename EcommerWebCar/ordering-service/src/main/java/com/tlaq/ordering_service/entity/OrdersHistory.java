package com.tlaq.ordering_service.entity;

import com.tlaq.ordering_service.entity.enums.OrdersStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "order_history")
public class OrdersHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    Orders order;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    OrdersStatus status;

    String note;

    @Column(name = "updated_by")
    String updatedBy;

    @CreationTimestamp
    LocalDateTime createdAt;
}