package com.tlaq.catalog_service.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name="show_room_image")
public class ShowRoomImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;
    String image;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "show_room_id")
    ShowRoom showRoom;
}