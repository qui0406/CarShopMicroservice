package com.tlaq.main_service.entity;

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
    String name;
    String address;
    String phone;
    String email;
    BigDecimal longitude;
    BigDecimal latitude;
    String zalo;
    String facebook;

    @Column(columnDefinition = "TEXT")
    String about;

    @Column(columnDefinition = "TEXT")
    String description;

    @Column(name="created_at")
    @CreationTimestamp
    LocalDateTime createdAt;

    @OneToOne
    Profile owner;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "show_room_id")
    List<ShowRoomImage> showRoomImages;
}
