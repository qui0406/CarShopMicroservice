package com.tlaq.notification_service.consumer;

import com.tlaq.event.dto.NotificationEvent;
import com.tlaq.notification_service.services.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationConsumer {
    NotificationService notificationService;

    @RabbitListener(queues = "q.notification")
    public void listen(NotificationEvent event) {
        log.info("📩 Received notification event for user: {}", event.getRecipientId());
        try {
            notificationService.processNotification(event);
        } catch (Exception e) {
            log.error("❌ Error processing notification: {}", e.getMessage());
        }
    }
}