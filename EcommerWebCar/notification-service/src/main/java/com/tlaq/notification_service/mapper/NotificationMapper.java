package com.tlaq.notification_service.mapper;

import com.tlaq.notification_service.dto.responses.NotificationResponse;
import com.tlaq.notification_service.entity.Notifications;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface NotificationMapper {
    @Mapping(target = "isRead", expression = "java(checkReadStatus(notification))")
    NotificationResponse toResponse(Notifications notification);

    // Hàm helper để check trạng thái đã đọc hay chưa
    default boolean checkReadStatus(Notifications notification) {
        if (notification.getStatus() == null) return false;
        return "READ".equalsIgnoreCase(notification.getStatus().toString());
    }
}
