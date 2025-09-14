package com.tlaq.main_service.dto.responses;

import com.tlaq.main_service.entity.OrderDetails;
import com.tlaq.main_service.entity.Profile;
import com.tlaq.main_service.entity.enums.PaymentStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrdersResponse {
    String id;
    PaymentStatus paymentStatus;
    OrderDetailsResponse orderDetails;
    ProfileResponse profile;

    @Data
    @Builder
    public static class ProfileResponse{
        String id;
        String username;
        String address;
        String phone;
    }
}
