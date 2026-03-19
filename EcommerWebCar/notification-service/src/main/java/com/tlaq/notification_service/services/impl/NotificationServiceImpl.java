package com.tlaq.notification_service.services.impl;

import com.tlaq.event.dto.NotificationEvent;
import com.tlaq.notification_service.entity.NotificationSetting;
import com.tlaq.notification_service.entity.Notifications;
import com.tlaq.notification_service.entity.enums.NotificationStatus;
import com.tlaq.notification_service.helper.TemplateEngine;
import com.tlaq.notification_service.repositories.NotificationRepository;
import com.tlaq.notification_service.repositories.NotificationSettingRepository;
import com.tlaq.notification_service.repositories.NotificationTemplateRepository;
import com.tlaq.notification_service.services.EmailService;
import com.tlaq.notification_service.services.NotificationService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class NotificationServiceImpl implements NotificationService {
    NotificationRepository notificationRepository;
    NotificationTemplateRepository templateRepository;
    NotificationSettingRepository settingRepository;
    EmailService emailService;
    TemplateEngine templateEngine;

    @Override
    public void processNotification(NotificationEvent event) {
        var template = templateRepository.findByTemplateCode(event.getTemplateCode())
                .orElseThrow(() -> new RuntimeException("Template not found: " + event.getTemplateCode()));

        // 2. Render nội dung
        String title = templateEngine.render(template.getTitleTemplate(), event.getParam());
        String content = templateEngine.render(template.getBodyTemplate(), event.getParam());

        // 3. Lưu vào Database (Trạng thái UNREAD)
        Notifications notification = Notifications.builder()
                .recipientId(event.getRecipientId())
                .senderId(event.getSenderId())
                .title(title)
                .content(content)
                .type(event.getType())
                .status(NotificationStatus.UNREAD)
                .createdAt(LocalDateTime.now())
                .metadata(event.getParam())
                .build();
        notificationRepository.save(notification);

        // 4. Kiểm tra cấu hình & Gửi Email qua SendGrid
        var settings = settingRepository.findByUserId(event.getRecipientId())
                .orElse(NotificationSetting.builder().emailEnabled(true).build());

        if (settings.isEmailEnabled() && event.getRecipientEmail() != null) {
            emailService.sendEmail(event.getRecipientEmail(), title, content);
        }
    }
}
