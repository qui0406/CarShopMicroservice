package com.tlaq.main_service.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

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
    LocalDate year;
    BigDecimal price;

    @CreationTimestamp
    LocalDateTime createdAt;
    @UpdateTimestamp
    LocalDateTime updatedAt;

    @ManyToOne
    @JoinColumn(name = "car_type_id", referencedColumnName = "id")
    CarType carType;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "car_feature_id", referencedColumnName = "id")
    CarFeature carFeature;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "car_service_id", referencedColumnName = "id")
    CarService carService;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "car_id")
    List<CarImage> carImages;
}
