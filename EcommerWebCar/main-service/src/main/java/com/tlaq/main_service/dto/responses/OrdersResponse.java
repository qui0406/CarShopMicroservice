package com.tlaq.main_service.dto.responses;

import com.tlaq.main_service.entity.OrderDetails;
import com.tlaq.main_service.entity.Profile;
import com.tlaq.main_service.entity.enums.PaymentStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrdersResponse {
    String id;
    PaymentStatus paymentStatus;
    OrderDetails orderDetails;
    Profile profile;
}
