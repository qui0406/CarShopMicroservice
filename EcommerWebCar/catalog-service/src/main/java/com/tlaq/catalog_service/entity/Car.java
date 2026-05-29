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
    boolean isReady = true;

    @Builder.Default
    @Column(name = "is_deleted")
    boolean deleted = false;

    @Builder.Default
    @Column(name = "is_deposited")
    boolean deposited = false;

    @Builder.Default
    @Column(name = "is_sold")
    boolean sold = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "show_room_id")
    ShowRoom showRoom;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "technical_spec_id", referencedColumnName = "id")
    TechnicalSpec technicalSpec;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "equipment_id", referencedColumnName = "id")
    Equipment equipment;

    String model3dUrl;
    String thumbnail;

    @Column(columnDefinition = "TEXT")
    String description;

    @OneToMany(mappedBy = "car", cascade = CascadeType.ALL, orphanRemoval = true)
    List<CarImage> carImages;

    @CreationTimestamp
    LocalDateTime createdAt;

    @UpdateTimestamp
    LocalDateTime updatedAt;
}
