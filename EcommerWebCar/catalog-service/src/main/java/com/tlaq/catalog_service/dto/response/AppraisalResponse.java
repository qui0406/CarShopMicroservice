package com.tlaq.catalog_service.dto.response;

import com.tlaq.catalog_service.entity.enums.AppraisalStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AppraisalResponse {
    String id;
    String userId;

    // Trả về tên Hãng và Model thay vì chỉ ID để Frontend hiển thị luôn [cite: 2026-02-25]
    String branchName;
    String modelName; // Tên từ DB hoặc khách hàng tự nhập
    String trimLevel;
    String engineSize;
    String fuelType;
    String transmission;

    Integer manufacturingYear;
    Integer mileage;

    String vinNumber;
    String licensePlate;
    String color;
    String interiorColor;

    Integer numberOfOwners;
    LocalDate registrationDate;

    String conditionNote;

    String contactName;
    String contactPhone;
    String contactEmail;
    String location;

    String accidentHistory;
    String serviceHistory;

    BigDecimal expectedPrice;
    BigDecimal offeredPrice; // Giá showroom đề nghị

    AppraisalStatus status;
    List<AppraisalImageResponse> images;

    LocalDateTime createdAt;
}
