package com.tlaq.payment_service.dto.response;

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
    BigDecimal totalAmount;
    String note;
    List<OrdersDetailsResponse> orderItems;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
