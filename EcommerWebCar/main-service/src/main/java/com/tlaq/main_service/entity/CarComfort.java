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
@Table(name="car_comfort")
public class CarComfort {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Builder.Default
    boolean mayDieuHoa = true;

    String manHinh;

    String ghe;

    @Builder.Default
    boolean sacKhongDay = true;

    @Builder.Default
    boolean copDien = true;

    String cuaSo;

    @Builder.Default
    boolean bluetooth = true;

    String loa;

    @Builder.Default
    boolean gps = true;
}