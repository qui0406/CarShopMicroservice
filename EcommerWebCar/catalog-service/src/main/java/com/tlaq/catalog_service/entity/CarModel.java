package com.tlaq.catalog_service.entity;


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

    // --- Quan hệ với Nhóm phân loại ---
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    CarCategory category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "car_branch_id")
    CarBranch carBranch;

    // --- Quan hệ với Kho hàng (Danh sách xe thực tế) ---
    @OneToMany(mappedBy = "carModel", cascade = CascadeType.ALL)
    List<Car> cars;
}
