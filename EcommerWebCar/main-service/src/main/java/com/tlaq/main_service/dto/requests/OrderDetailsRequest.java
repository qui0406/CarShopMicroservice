package com.tlaq.main_service.dto.requests;

import jakarta.persistence.Column;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderDetailsRequest {
    String orderId;
    String address;
    String fullName;
    LocalDate dob;
    String cccd;
    String phoneNumber;
    BigDecimal unitPrice;
    int quantity;
    BigDecimal totalAmount;
}
