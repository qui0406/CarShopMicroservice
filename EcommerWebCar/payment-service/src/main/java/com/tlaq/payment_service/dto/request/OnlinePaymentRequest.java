package com.tlaq.payment_service.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OnlinePaymentRequest {
    private String txnRef; //orderId
    private String ipAddress; //ipaddres
    private Long amount;
    private BigDecimal deposit;
    private LocalDate expiredAt;
}
