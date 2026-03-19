package com.tlaq.notification_service.entity;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "notification_settings")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationSetting {
    @Id
    String id;

    @Indexed(unique = true)
    String userId;

    boolean emailEnabled = true;
    boolean pushEnabled = true;

    List<String> disabledTypes;
}