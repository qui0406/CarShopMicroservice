package com.tlaq.main_service.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

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
    @OneToOne(cascade = CascadeType.ALL)
    CarType carType;

    @OneToOne(cascade = CascadeType.ALL)
    CarFeature carFeature;

    @OneToOne(cascade = CascadeType.ALL)
    CarService carService;

    @ManyToOne(cascade = CascadeType.ALL)
    CarImage carImage;
}
