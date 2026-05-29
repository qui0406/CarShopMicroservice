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
    String id;
    String carId;
    String carName;
    String fullName;
    String phoneNumber;
    String address;
    String cccd;
    LocalDate dob;
    BigDecimal unitPrice;
    BigDecimal totalAmount; // computed: same as unitPrice now
}