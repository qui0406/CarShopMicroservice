package com.tlaq.catalog_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CarResponse {
    String id;
    String name;
    BigDecimal price;

    // Thông tin từ các quan hệ (Nên dùng DTO con để tránh lộ thông tin thừa)
    CarModelResponse carModel;
    CarSpecificationResponse specification;
    CarServiceResponse carService;
    List<String> images; // Chỉ cần danh sách URL ảnh

    // Thông tin định danh xe
    boolean isUsed;
    int mileage;
    int manufacturingYear;
    String vinNumber;
    String inspectionReportUrl;
    String model3dUrl;

    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
