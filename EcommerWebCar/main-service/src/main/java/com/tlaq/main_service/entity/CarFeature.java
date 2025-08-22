package com.tlaq.main_service.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name="car_feature")
public class CarFeature {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @JoinColumn(name ="car_comfort_id", nullable = false)
    @OneToOne(cascade = CascadeType.ALL)
    CarComfort carComfort;

    @JoinColumn(name = "car_exterior_id", nullable = false)
    @OneToOne(cascade = CascadeType.ALL)
    CarExterior carExterior;

    @JoinColumn(name = "feature_safety_id", nullable = false)
    @OneToOne(cascade = CascadeType.ALL)
    FeatureSafety featureSafety;
}
