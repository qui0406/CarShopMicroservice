package com.tlaq.catalog_service.entity;


import com.tlaq.catalog_service.entity.enums.BodyType;
import com.tlaq.catalog_service.entity.enums.FuelType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name="car_model")
public class CarModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(nullable = false)
    String name; // Vd: "Mercedes C300 AMG 2026"

    int seatCapacity;

    @Column(columnDefinition = "TEXT")
    String description;

    String thumbnailImage; // Ảnh đại diện của mẫu xe này hiển thị ở trang chủ

    // --- Quan hệ với Nhóm phân loại ---
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    CarCategory category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "car_branch_id")
    CarBranch carBranch;

    // --- Quan hệ với Kỹ thuật & Trang bị (OneToOne) ---
    // Cascade ALL để khi tạo Model thì lưu luôn Spec và Equipment
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "technical_spec_id", referencedColumnName = "id")
    TechnicalSpec technicalSpec;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "equipment_id", referencedColumnName = "id")
    Equipment equipment;

    // --- Quan hệ với Kho hàng (Danh sách xe thực tế) ---
    @OneToMany(mappedBy = "carModel", cascade = CascadeType.ALL)
    List<Car> cars;
}
