package com.tlaq.catalog_service.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AppraisalRequestDto {
    @NotNull(message = "Hãng xe không được để trống")
    Long branchId;

    // modelId là không bắt buộc, nếu khách hàng không tìm thấy model khớp 100%
    Long modelId;

    // Nếu modelId trống, khách hàng tự nhập tên dòng xe
    String modelName;

    @NotNull(message = "Phiên bản (Trim) không được để trống")
    String trimLevel;

    @NotNull(message = "Dung tích động cơ không được để trống")
    String engineSize;

    @NotNull(message = "Loại nhiên liệu không được để trống")
    String fuelType;

    @NotNull(message = "Loại hộp số không được để trống")
    String transmission;

    @Min(value = 1900, message = "Năm sản xuất không hợp lệ")
    Integer manufacturingYear;

    @Min(value = 0, message = "Số km đã đi không được âm")
    Integer mileage;

    @NotNull(message = "Số khung (VIN) không được để trống")
    String vinNumber;

    @NotNull(message = "Biển số xe không được để trống")
    String licensePlate;

    @NotNull(message = "Màu ngoại thất không được để trống")
    String color;

    String interiorColor;

    @NotNull(message = "Số đời chủ không được để trống")
    @Min(1)
    Integer numberOfOwners;

    LocalDate registrationDate;

    String conditionNote;

    @NotNull(message = "Tên người liên hệ không được để trống")
    String contactName;

    @NotNull(message = "Số điện thoại liên hệ không được để trống")
    String contactPhone;

    String contactEmail;

    @NotNull(message = "Địa điểm xem xe không được để trống")
    String location;

    String accidentHistory;
    String serviceHistory;

    @Positive(message = "Giá mong muốn phải là số dương")
    BigDecimal expectedPrice;
}
