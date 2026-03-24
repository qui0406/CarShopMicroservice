package com.tlaq.catalog_service.entity;

import com.tlaq.catalog_service.entity.enums.FuelType;
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
@Table(name="technical_spec")
public class TechnicalSpec {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    String engine;        // dongCo
    String transmission;  // hopSo

    @Enumerated(EnumType.STRING) // Quan trọng: Bảo Hibernate lưu dạng chuỗi [cite: 2026-03-09]
    @Column(name = "fuel_type")
    FuelType fuelType;      // loaiNhienLieu (Xăng, Dầu, Điện)
    BigDecimal displacement; // dungTichXiLanh

    // Nhóm Hiệu suất [cite: 2026-03-09]
    BigDecimal horsepower;   // congSuat (Mã lực)
    BigDecimal torque;       // momenXoan
    BigDecimal topSpeed;     // tocDoToiDa

    // Nhóm Kích thước & Trọng lượng [cite: 2026-03-09]
    BigDecimal length;       // chieuDai
    BigDecimal width;        // (Nên thêm) Chiều rộng
    BigDecimal height;       // (Nên thêm) Chiều cao
    BigDecimal groundClearance; // (Nên thêm) Khoảng sáng gầm xe
    BigDecimal payload;      // taiTrong
    BigDecimal fuelCapacity; // dungTichXang/Pin
}
