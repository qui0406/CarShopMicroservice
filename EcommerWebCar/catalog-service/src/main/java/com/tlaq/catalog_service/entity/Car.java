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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "car_model_id")
    CarModel carModel;

    String vinNumber;
    String licensePlate;
    String color;
    BigDecimal price;

    int manufacturingYear;

    boolean isUsed;
    int mileage;
    String interiorColor;
    int numberOfOwners;
    LocalDate registrationDate;

    @Column(columnDefinition = "TEXT")
    String accidentHistory;

    @Column(columnDefinition = "TEXT")
    String serviceHistory;

    String inspectionReportUrl;

    @Builder.Default
    @Column(name = "is_ready")
    private boolean isReady = true;

    @Builder.Default
    @Column(name = "is_deleted")
    boolean deleted = false;

    String model3dUrl;

    @OneToMany(mappedBy = "car", cascade = CascadeType.ALL, orphanRemoval = true)
    List<CarImage> carImages; // Ảnh chụp thực tế góc cạnh của chiếc xe này

    @CreationTimestamp
    LocalDateTime createdAt;

    @UpdateTimestamp
    LocalDateTime updatedAt;
}
