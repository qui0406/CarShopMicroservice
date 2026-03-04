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
    BigDecimal totalAmount;
    String note;
    List<OrdersDetailsResponse> orderItems;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}