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
@Table(name="order_history")
public class OrdersHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    Orders order;

    @Enumerated(EnumType.STRING)
    OrdersStatus status;

    String note;

    @Column(name = "updated_by") // Giữ cái này [cite: 2026-03-10]
    String updatedBy;

    // Đổi tên cột hoặc dùng chung updatedBy [cite: 2026-03-10]
    // @Column(name = "created_by")
    // String createdBy;

    @CreationTimestamp
    LocalDateTime createdAt;
}
