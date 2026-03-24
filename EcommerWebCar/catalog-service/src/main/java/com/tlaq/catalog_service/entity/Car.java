package com.tlaq.catalog_service.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name="car")
public class Car {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
    String name;
    BigDecimal price;

    @CreationTimestamp
    LocalDateTime createdAt;
    @UpdateTimestamp
    LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "car_model_id")
    CarModel carModel;

    boolean isUsed;
    int mileage;
    int manufacturingYear;
    String vinNumber;
    String inspectionReportUrl;

    String model3dUrl;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "car_specification_id")
    Equipment equipment;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "car_service_id", referencedColumnName = "id")
    TechnicalSpec technicalSpec;

    @OneToMany(mappedBy = "car", cascade = CascadeType.ALL, orphanRemoval = true)
    List<CarImage> carImages;
}
