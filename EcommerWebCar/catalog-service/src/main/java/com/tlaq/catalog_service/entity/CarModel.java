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
    String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    CarCategory category;

    int seatCapacity; // Số chỗ ngồi (Vd: 5 chỗ)

    @Enumerated(EnumType.STRING)
    BodyType bodyType;

    @Enumerated(EnumType.STRING)
    FuelType fuelType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "car_branch_id")
    CarBranch carBranch;

    @Column(columnDefinition = "TEXT")
    String description;

    // Quan hệ ngược lại với danh sách các xe cụ thể trong kho
    @OneToMany(mappedBy = "carModel", cascade = CascadeType.ALL)
    List<Car> cars;
}
