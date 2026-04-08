package com.tlaq.notification_service.services;

import com.tlaq.event.dto.NotificationEvent;
import com.tlaq.notification_service.dto.PageResponse;
import com.tlaq.notification_service.dto.responses.NotificationResponse;

public interface NotificationService {
    void processNotification(NotificationEvent event);
    PageResponse<NotificationResponse> getMyNotifications(int page, int size);
    void markAsRead(String id);
}
