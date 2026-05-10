package com.tlaq.payment_service.dto.response;

import com.tlaq.payment_service.entity.enums.OrdersStatus;
import com.tlaq.payment_service.entity.enums.OrdersType;
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

    BigDecimal baseAmount;      // Giá gốc
    BigDecimal taxAmount;       // Thuế
    BigDecimal plateFeeAmount;  // Phí biển số
    BigDecimal insuranceAmount; // Bảo hiểm
    BigDecimal totalAmount;     // Tổng cộng
    BigDecimal depositAmount;

    String note;
    List<OrdersDetailsResponse> orderItems;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
