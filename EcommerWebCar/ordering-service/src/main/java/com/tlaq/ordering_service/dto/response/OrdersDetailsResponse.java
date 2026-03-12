package com.tlaq.ordering_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrdersDetailsResponse {
    String carId;
    String fullName;
    String phoneNumber;
    String address;
    int quantity;
    BigDecimal unitPrice;   // Giá lăn bánh của 1 chiếc
    BigDecimal totalAmount; // unitPrice * quantity
}