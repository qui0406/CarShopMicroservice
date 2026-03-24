package com.tlaq.event.dto;

import com.tlaq.notification_service.entity.enums.NotificationType;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationEvent {
    NotificationType type;
    String channel; // Vd: EMAIL, PUSH, SMS
    String recipientId;
    String recipientEmail; // QUAN TRỌNG: Thêm trường này để gửi mail
    String senderId;
    String templateCode;
    Map<String, Object> param;
    String subject; // Tiêu đề dự phòng nếu không dùng template
    String body;    // Nội dung dự phòng nếu không dùng template
}