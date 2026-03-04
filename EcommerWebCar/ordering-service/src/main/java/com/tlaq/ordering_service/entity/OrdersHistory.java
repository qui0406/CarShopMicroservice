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

    // Trạng thái của đơn hàng tại thời điểm ghi log
    @Enumerated(EnumType.STRING)
    @Column(name = "order_status")
    OrdersStatus status;

    // Ghi chú chi tiết về lý do thay đổi (VD: "Đã xác nhận đặt cọc qua VNPAY")
    @Column(columnDefinition = "TEXT")
    String note;

    // ID của người thực hiện thay đổi (Lấy từ Identity Service)
    // Có thể là User ID (khách hàng) hoặc Staff ID (nhân viên showroom)
    @Column(name = "updated_by")
    String updatedBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    LocalDateTime createdAt;
}
