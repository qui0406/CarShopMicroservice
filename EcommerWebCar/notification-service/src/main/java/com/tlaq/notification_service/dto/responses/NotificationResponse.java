package com.tlaq.notification_service.dto.responses;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationResponse {
    String id;
    String title;
    String content;
    String type;
    String status;
    String actionUrl;
    LocalDateTime createdAt;
    boolean isRead;
}