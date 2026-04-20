package com.tlaq.catalog_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class InventoryResponse {
    String id;
    Integer quantity;
    LocalDateTime lastUpdated; // Ngày cập nhật kho gần nhất

    // --- Thông tin định danh xe ---
    String carId;
    String carName;        // Vd: Mazda 3 Premium
    String carThumbnail;   // Link ảnh đại diện xe
    String carSku;         // Mã SKU xe
    Long carPrice;         // Giá bán để quản lý biết giá trị hàng tồn

    // --- Thông số kỹ thuật nhanh (Giúp nhân viên tư vấn) ---
    String color;          // Màu sắc
    String fuelType;       // Xăng/Dầu/Điện
    String transmission;   // Số sàn/Tự động
}