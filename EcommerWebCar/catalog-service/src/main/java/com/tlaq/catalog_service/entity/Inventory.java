package com.tlaq.catalog_service.entity;

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
@Table(name="inventory")
public class Inventory {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    int quantity;

    @CreationTimestamp
    @Column(name = "created_at")
    LocalDateTime createdAt;

    @OneToOne
    Car car;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "show_room_id")
    ShowRoom showRoom;
}
