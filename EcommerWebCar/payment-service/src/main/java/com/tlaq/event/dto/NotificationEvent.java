package com.tlaq.event.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationEvent {
    String type;
    String channel; // Vd: EMAIL, PUSH, SMS
    String recipientId;
    String recipientEmail;
    String senderId;
    String templateCode;
    Map<String, Object> param;
    String subject;
    String body;
}
