package com.tlaq.main_service.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name="car_service")
public class CarService {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    String id;
    String dongCo;
    String hopSo;
    BigDecimal congSuat;
    BigDecimal momenXoan;
    BigDecimal dungTichXiLanh;
    BigDecimal dungTichXang;
    BigDecimal taiTrong;
    BigDecimal chieuDai;
    String mauSac;
    BigDecimal tocDoToiDa;
    String loaiNhienLieu;
}
