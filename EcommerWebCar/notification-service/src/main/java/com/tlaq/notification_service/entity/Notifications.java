package com.tlaq.notification_service.entity;

import com.tlaq.notification_service.entity.enums.NotificationStatus;
import com.tlaq.notification_service.entity.enums.NotificationType;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Map;

@Document(collection = "notifications")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Notifications {
    @Id
    String id;

    @Indexed
    String recipientId;
    String senderId;

    String title;
    String content;

    NotificationType type;

    NotificationStatus status;

    Map<String, Object> metadata;
    LocalDateTime createdAt;
}