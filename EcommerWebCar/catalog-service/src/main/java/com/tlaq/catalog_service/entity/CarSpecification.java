package com.tlaq.catalog_service.entity;

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
@Table(name="car_specification")
public class CarSpecification {
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

    String den;
    String gatMua;

    @Builder.Default
    boolean smartKey= true;

    @Builder.Default
    boolean guongDien=true;

    @Builder.Default
    boolean tuiKhi= true;
    String phanh;

    @Builder.Default
    boolean canBangDienTu= true;

    @Builder.Default
    boolean hoTroGiuLan= true;

    @Builder.Default
    boolean camera= true;

    @Builder.Default
    boolean camBienDoXe= true;
}
