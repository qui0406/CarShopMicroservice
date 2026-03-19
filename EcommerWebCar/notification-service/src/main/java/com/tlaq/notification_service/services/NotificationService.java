package com.tlaq.notification_service.services;

import com.tlaq.event.dto.NotificationEvent;

public interface NotificationService {
    void processNotification(NotificationEvent event);
}
