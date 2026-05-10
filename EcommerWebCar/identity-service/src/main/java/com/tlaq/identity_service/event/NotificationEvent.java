package com.tlaq.identity_service.event;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Map;

/**
 * Event được publish lên RabbitMQ sau khi user đăng ký tài khoản thành công.
 * Notification-service sẽ consume và gửi email chào mừng.
 *
 * <p>Cần khớp về cấu trúc JSON với {@code com.tlaq.event.dto.NotificationEvent}
 * bên notification-service (cùng field names để Jackson deserialize đúng).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationEvent {

    /** Loại thông báo — luôn là "USER_REGISTERED" cho event này */
    String type;

    /** Keycloak userId của người dùng vừa đăng ký */
    String recipientId;

    /** Email để notification-service gửi thư */
    String recipientEmail;

    /** null — không có sender trong trường hợp system event */
    String senderId;

    /** Template code trong NotificationTemplate. Dùng "WELCOME_USER" */
    String templateCode;

    /** Tham số đổ vào template: username, firstName, ... */
    Map<String, Object> param;

    /** Tiêu đề fallback nếu template không tồn tại */
    String subject;

    /** Nội dung fallback nếu template không tồn tại */
    String body;
}
