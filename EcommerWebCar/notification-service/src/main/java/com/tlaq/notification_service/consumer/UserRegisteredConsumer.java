package com.tlaq.notification_service.consumer;

import com.tlaq.event.dto.NotificationEvent;
import com.tlaq.notification_service.configs.RabbitMQConfig;
import com.tlaq.notification_service.entity.enums.NotificationType;
import com.tlaq.notification_service.services.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Consumer lắng nghe event đăng ký tài khoản mới từ identity-service.
 * Khi nhận được, tạo thông báo chào mừng và gửi email xác nhận đến người dùng.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class UserRegisteredConsumer {

    private static final String TEMPLATE_CODE = "WELCOME_USER";

    private final NotificationService notificationService;

    @RabbitListener(queues = RabbitMQConfig.USER_REGISTERED_QUEUE)
    public void handleUserRegistered(NotificationEvent event) {
        log.info("🎉 Nhận sự kiện đăng ký tài khoản mới — userId: {}, email: {}",
                event.getRecipientId(), event.getRecipientEmail());
        try {
            // Đảm bảo type đúng
            if (event.getType() == null) {
                event.setType(NotificationType.USER_REGISTERED);
            }
            // Nếu không có templateCode, dùng fallback subject/body
            if (event.getTemplateCode() == null) {
                event.setTemplateCode(TEMPLATE_CODE);
                event.setSubject("Chào mừng bạn đến với EcommerCar!");
                event.setBody("Tài khoản của bạn đã được tạo thành công. Cảm ơn bạn đã đăng ký!");
                event.setParam(Map.of(
                        "username", event.getParam() != null && event.getParam().containsKey("username")
                                ? event.getParam().get("username")
                                : event.getRecipientId()
                ));
            }
            notificationService.processNotification(event);
            log.info("✅ Đã xử lý thông báo đăng ký cho user: {}", event.getRecipientId());
        } catch (Exception e) {
            log.error("❌ Lỗi khi xử lý thông báo đăng ký cho user {}: {}",
                    event.getRecipientId(), e.getMessage(), e);
        }
    }
}
