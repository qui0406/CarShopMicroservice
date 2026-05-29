package com.tlaq.payment_service.dto.response;

import com.tlaq.payment_service.entity.enums.PaymentStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentDetailsResponse {
    String paymentId;
    String orderId;
    PaymentStatus paymentStatus;
    
    BigDecimal totalAmount;
    BigDecimal paidAmount;
    BigDecimal remainAmount;

    CustomerDetails customerDetails;
    OrderDetails orderDetails;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class CustomerDetails {
        String fullName;
        String address;
        LocalDate dob;
        String cccd;
        String phoneNumber;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class OrderDetails {
        String carId;
        String carName;
    }
}
