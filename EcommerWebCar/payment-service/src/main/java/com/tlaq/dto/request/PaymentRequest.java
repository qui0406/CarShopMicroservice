package com.tlaq.dto.request;

import com.tlaq.entity.enums.PaymentStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentRequest {
    private String txnRef; //orderId
    private BigDecimal amount; //totalOrderIdAmount
    private PaymentStatus ipAddress; //ipaddress
}
