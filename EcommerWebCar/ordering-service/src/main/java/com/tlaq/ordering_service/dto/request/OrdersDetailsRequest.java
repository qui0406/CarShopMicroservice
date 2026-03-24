package com.tlaq.ordering_service.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrdersDetailsRequest {
    String carId;
    String fullName;
    String phoneNumber;
    String address;
    String cccd;
    LocalDate dob;

    int quantity;
}