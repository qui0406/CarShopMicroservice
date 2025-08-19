package com.tlaq.payment_service.dto.event;

import com.tlaq.payment_service.entity.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderEvent {
    private String profileId;
    private String orderId;
    private BigDecimal totalAmount;
    private PaymentStatus paymentStatus;
}

