package com.tlaq.catalog_service.dto.response;

import com.tlaq.catalog_service.entity.enums.AppraisalStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;

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
    String modelName;

    Integer manufacturingYear;
    Integer mileage;
    String conditionNote;

    BigDecimal expectedPrice;
    BigDecimal offeredPrice; // Giá showroom đề nghị

    AppraisalStatus status;
    List<AppraisalImageResponse> images;

    LocalDateTime createdAt;
}
