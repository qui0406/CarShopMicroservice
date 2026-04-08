package com.tlaq.notification_service.consumer;

import com.tlaq.event.dto.NotificationEvent;
import com.tlaq.notification_service.configs.RabbitMQConfig;
import com.tlaq.notification_service.services.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor  // ← Fix: field phải là final để Lombok inject đúng
@Slf4j
public class NotificationConsumer {

    private final NotificationService notificationService; // ← Thêm final

    @RabbitListener(queues = RabbitMQConfig.NOTIFICATION_QUEUE)
    public void listen(NotificationEvent event) {
        log.info("📩 Received notification event for user: {}", event.getRecipientId());
        try {
            notificationService.processNotification(event);
        } catch (Exception e) {
            log.error("❌ Error processing notification for user {}: {}",
                    event.getRecipientId(), e.getMessage(), e);
        }
    }
}