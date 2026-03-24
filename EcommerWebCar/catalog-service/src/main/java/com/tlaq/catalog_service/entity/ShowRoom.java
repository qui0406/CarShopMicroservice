package com.tlaq.catalog_service.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
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
@Table(name="show_room")
public class ShowRoom {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(nullable = false)
    String name;

    @Column(nullable = false)
    String address;

    String phone;
    String email;

    // Tọa độ để làm tính năng bản đồ (Showroom gần nhất)
    BigDecimal longitude;
    BigDecimal latitude;

    // Mạng xã hội để khách hàng liên hệ xem xe cũ
    String zalo;
    String facebook;

    @Column(columnDefinition = "TEXT")
    String about;

    @Column(columnDefinition = "TEXT")
    String description;

    // QUAN TRỌNG: Chỉ lưu ID của Profile từ Identity Service
    @Column(name = "owner_id", nullable = false)
    String ownerId;

    @Column(name="created_at", updatable = false)
    @CreationTimestamp
    LocalDateTime createdAt;

    // Quản lý hình ảnh Showroom
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "show_room_id")
    List<ShowRoomImage> showRoomImages;

    // Quan hệ với xe trong kho của Showroom này (Nếu bạn làm tính năng kho riêng)
    @OneToMany(mappedBy = "showRoom")
    List<Inventory> inventories;
}