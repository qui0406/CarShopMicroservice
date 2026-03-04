package com.tlaq.catalog_service.entity;

import com.tlaq.catalog_service.entity.enums.AppraisalStatus;
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
@Table(name = "appraisal_requests")
public class AppraisalRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(name = "user_id", nullable = false)
    String userId; // ID từ Identity Service

    // Thay đổi từ String sang quan hệ Entity
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id")
    CarBranch branch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "model_id")
    CarModel model;

    Integer manufacturingYear;
    Integer mileage;

    @Column(columnDefinition = "TEXT")
    String conditionNote;

    BigDecimal expectedPrice;
    BigDecimal offeredPrice;

    @Enumerated(EnumType.STRING)
    AppraisalStatus status;

    @OneToMany(mappedBy = "appraisalRequest", cascade = CascadeType.ALL)
    List<AppraisalImage> images;

    @CreationTimestamp
    LocalDateTime createdAt;
}
