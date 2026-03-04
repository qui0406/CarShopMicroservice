package com.tlaq.ordering_service.dto.request;

import com.tlaq.ordering_service.entity.enums.OrdersType;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrdersRequest {
    OrdersType type; // PURCHASE hoặc DEPOSIT
    String note;
    List<OrdersDetailsRequest> orderItems;
}