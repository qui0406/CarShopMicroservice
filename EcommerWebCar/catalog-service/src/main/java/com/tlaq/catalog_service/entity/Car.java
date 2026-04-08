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

    // --- Liên kết ngược về Mẫu xe ---
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "car_model_id")
    CarModel carModel;

    // --- Đặc tính duy nhất của từng chiếc xe ---
    String vinNumber; // Số khung
    String color;     // Màu sắc ngoại thất
    BigDecimal price; // Giá bán cụ thể

    int manufacturingYear; // Năm sản xuất thực tế (Vd: Model 2026 nhưng SX cuối 2025)

    // --- Dành cho mảng xe cũ (Used Car) ---
    boolean isUsed;
    int mileage; // Odo
    String inspectionReportUrl;

    // --- Media cho chiếc xe cụ thể này ---
    String model3dUrl;

    @OneToMany(mappedBy = "car", cascade = CascadeType.ALL, orphanRemoval = true)
    List<CarImage> carImages; // Ảnh chụp thực tế góc cạnh của chiếc xe này

    @CreationTimestamp
    LocalDateTime createdAt;

    @UpdateTimestamp
    LocalDateTime updatedAt;
}
