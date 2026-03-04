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
    Long id;
    String carId;
    String fullName;
    String phoneNumber;
    String address;
    String cccd;
    LocalDate dob;
    BigDecimal unitPrice;
    int quantity;
    BigDecimal totalAmount;
}