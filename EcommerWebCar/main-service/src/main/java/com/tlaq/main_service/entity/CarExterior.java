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
@Table(name="car_exterior")
public class CarExterior {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    String den;
    String gatMua;

    @Builder.Default
    boolean smartKey= true;

    @Builder.Default
    boolean guongDien=true;
}
