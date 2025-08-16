package com.tlaq.main_service.dto.event;

import com.tlaq.main_service.entity.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderEvent {
    private String orderId;
    private BigDecimal totalAmount;
    private PaymentStatus paymentStatus;
}