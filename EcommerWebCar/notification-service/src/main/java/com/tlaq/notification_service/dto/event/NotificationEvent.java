package com.tlaq.notification_service.dto.event;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationEvent {
    String type;           // ORDER_SUCCESS, PAYMENT_FAILED, NEW_MESSAGE...
    String recipientId;
    String recipientEmail; // Gửi kèm email để Notification Service dùng luôn
    String senderId;

    String templateCode;   // Mã template để mapping với NotificationTemplate
    Map<String, Object> param; // Chứa dữ liệu để đổ vào template (Vd: { "orderId": "ORD123" })

    String actionUrl;      // Link khi click vào thông báo
}