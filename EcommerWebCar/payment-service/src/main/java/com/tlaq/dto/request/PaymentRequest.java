package com.tlaq.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentRequest {
    private String txnRef; //orderId
    private Integer amount; //totalOrderIdAmount
    private String ipAddress; //ipaddress
}
