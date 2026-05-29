package com.tlaq.ordering_service.dto.response;

import com.tlaq.ordering_service.entity.enums.OrdersStatus;
import com.tlaq.ordering_service.entity.enums.OrdersType;
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
public class OrdersResponse {
    String id;
    String userId;
    OrdersStatus status;
    OrdersType type;

    String carName;
    String carImage;

    BigDecimal baseAmount;      // Tổng giá gốc của các xe (chưa thuế phí lăn bánh)
    BigDecimal taxAmount;       // Tổng lệ phí trước bạ (10% - 12%)
    BigDecimal plateFeeAmount;  // Tổng phí cấp biển số (1tr hoặc 20tr)
    BigDecimal insuranceAmount; // Phí bảo trì đường bộ & BH dân sự (Cố định)
    BigDecimal totalAmount;     // Tổng giá lăn bánh cuối cùng (= sum các loại trên)
    BigDecimal depositAmount;   // Số tiền cần đặt cọc (ví dụ: 1% của totalAmount)

    String note;
    OrdersDetailsResponse orderItem;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}