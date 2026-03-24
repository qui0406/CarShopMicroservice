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
@Table(name = "appraisal_images")
public class AppraisalImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(nullable = false)
    String imageUrl;

    // Phân loại ảnh (VD: EXTERIOR, INTERIOR, ENGINE, DOCUMENT)
    @Column(name = "image_type")
    String imageType;

    // Quan hệ ngược lại với yêu cầu định giá
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appraisal_request_id", nullable = false)
    AppraisalRequest appraisalRequest;

    @CreationTimestamp
    @Column(name = "uploaded_at", updatable = false)
    LocalDateTime uploadedAt;
}
