package com.tlaq.ordering_service.dto.response;

import com.tlaq.ordering_service.entity.enums.OrdersStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrdersHistoryResponse {
    String orderId;
    OrdersStatus status;
    String note;
    String updatedBy;
    LocalDateTime createdAt;
}