package com.tlaq.payment_service.dto.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ResVNPayEvent {
    private String code;

    private String message;

    private String orderId;
}
