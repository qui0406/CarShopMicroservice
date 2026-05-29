package com.tlaq.payment_service.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

/**
 * Bảng lưu cấu hình lệ phí động.
 *
 * <p>Các key mẫu:
 * <ul>
 *   <li>{@code REGISTRATION_TAX_RATE} — tỉ lệ phí trước bạ (0.12 = 12%)</li>
 *   <li>{@code PLATE_FEE}             — phí biển số (đồng)</li>
 *   <li>{@code INSPECTION_FEE}        — phí đăng kiểm (đồng)</li>
 * </ul>
 *
 * <p>Các region:
 * <ul>
 *   <li>{@code HANOI}  — Hà Nội</li>
 *   <li>{@code HCM}    — TP. Hồ Chí Minh</li>
 *   <li>{@code OTHER}  — các tỉnh/thành còn lại</li>
 *   <li>{@code ALL}    — áp dụng toàn quốc (không phân biệt vùng)</li>
 * </ul>
 *
 * <p>fuelType: {@code ALL | ELECTRIC | GASOLINE | HYBRID | DIESEL}
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(
    name = "fee_config",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_fee_key_region_fuel",
        columnNames = {"fee_key", "region", "fuel_type"}
    )
)
public class FeeConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    /** Mã loại phí, ví dụ: REGISTRATION_TAX_RATE, PLATE_FEE, INSPECTION_FEE */
    @Column(name = "fee_key", nullable = false, length = 64)
    String key;

    /** Giá trị (tỉ lệ hoặc số tiền tuyệt đối) */
    @Column(nullable = false, precision = 20, scale = 4)
    BigDecimal value;

    /** Vùng địa lý áp dụng: HANOI | HCM | OTHER | ALL */
    @Column(name = "region", nullable = false, length = 16)
    String region;

    /** Loại nhiên liệu áp dụng: ALL | ELECTRIC | GASOLINE | HYBRID | DIESEL */
    @Column(name = "fuel_type", nullable = false, length = 16)
    String fuelType;

    /** Mô tả ngắn gọn mục đích của khoản phí */
    @Column(length = 255)
    String description;

    /** Chỉ row có active=true mới được sử dụng */
    @Column(nullable = false)
    boolean active;
}
