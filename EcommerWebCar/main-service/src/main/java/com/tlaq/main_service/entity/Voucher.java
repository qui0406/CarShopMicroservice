package com.tlaq.main_service.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name="voucher")
public class Voucher {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    String title;
    String description;
    String content;
    @Column(name="created_date_time")
    LocalDateTime createdDateTime;

    @Column(name="end_date_time")
    LocalDateTime endDateTime;

    @ManyToOne
    @JoinColumn(name = "showroom_id")
    ShowRoom showRoom;
}
