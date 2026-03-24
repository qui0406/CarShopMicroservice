package com.tlaq.payment_service.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentRequest {
    String orderId;
    BigDecimal totalAmount;
    // Khách có thể chọn thanh toán hết luôn hoặc chỉ cọc
    BigDecimal depositAmount;
}