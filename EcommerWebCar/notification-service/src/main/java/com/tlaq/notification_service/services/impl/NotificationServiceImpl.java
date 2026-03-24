package com.tlaq.notification_service.services.impl;

import com.tlaq.event.dto.NotificationEvent;
import com.tlaq.notification_service.dto.PageResponse;
import com.tlaq.notification_service.dto.requests.EmailRequest;
import com.tlaq.notification_service.dto.requests.Recipient;
import com.tlaq.notification_service.dto.responses.NotificationResponse;
import com.tlaq.notification_service.entity.NotificationSetting;
import com.tlaq.notification_service.entity.Notifications;
import com.tlaq.notification_service.entity.enums.NotificationStatus;
import com.tlaq.notification_service.helper.TemplateEngine;
import com.tlaq.notification_service.mapper.NotificationMapper;
import com.tlaq.notification_service.repositories.NotificationRepository;
import com.tlaq.notification_service.repositories.NotificationSettingRepository;
import com.tlaq.notification_service.repositories.NotificationTemplateRepository;
import com.tlaq.notification_service.repositories.client.IdentityClient;
import com.tlaq.notification_service.services.EmailService;
import com.tlaq.notification_service.services.NotificationService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

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
    IdentityClient identityClient;
    NotificationMapper notificationMapper;

    @Override
    public void processNotification(NotificationEvent event) {
        String title;
        String content;

        if (event.getTemplateCode() != null) {
            var templateOpt = templateRepository.findByTemplateCode(event.getTemplateCode());
            if (templateOpt.isPresent()) {
                var template = templateOpt.get();
                title   = templateEngine.render(template.getTitleTemplate(), event.getParam());
                content = templateEngine.render(template.getBodyTemplate(),  event.getParam());
            } else if (event.getSubject() != null && event.getBody() != null) {
                log.warn("⚠️ Template '{}' not found, dùng subject/body fallback", event.getTemplateCode());
                title   = event.getSubject();
                content = event.getBody();
            } else {
                throw new RuntimeException("Template not found và không có fallback: " + event.getTemplateCode());
            }
        } else if (event.getSubject() != null && event.getBody() != null) {
            // templateCode null → dùng thẳng subject/body
            title   = event.getSubject();
            content = event.getBody();
        } else {
            throw new RuntimeException("Phải có templateCode hoặc subject+body");
        }

        // Lưu notification
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

        // Gửi email nếu được bật
        sendEmailIfEnabled(event, title, content);
    }

    private void sendEmailIfEnabled(NotificationEvent event, String title, String content) {
        if (event.getRecipientEmail() == null || event.getRecipientEmail().isBlank()) {
            log.warn("⚠️ No recipient email provided for user: {}", event.getRecipientId());
            return;
        }

        NotificationSetting settings = settingRepository
                .findByUserId(event.getRecipientId())
                .orElse(NotificationSetting.builder().emailEnabled(true).build());

        if (!settings.isEmailEnabled()) {
            log.info("📵 Email notifications disabled for user: {}", event.getRecipientId());
            return;
        }

        try {
            EmailRequest emailRequest = EmailRequest.builder()
                    .to(List.of(Recipient.builder()
                            .email(event.getRecipientEmail())
                            .name(event.getRecipientId()) // hoặc lấy displayName nếu có
                            .build()))
                    .subject(title)
                    .content(content)
                    .build();

            emailService.sendEmail(emailRequest);
            log.info("📧 Email sent via SendGrid to: {}", event.getRecipientEmail());
        } catch (Exception e) {
            // Không throw để tránh message bị requeue vô tận khi SendGrid lỗi
            log.error("❌ Failed to send email to {}: {}", event.getRecipientEmail(), e.getMessage());
        }
    }

    @Override
    public PageResponse<NotificationResponse> getMyNotifications(int page, int size) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userKeycloakId = auth.getName();
        String userId = identityClient.getProfileByUserKeycloakId(userKeycloakId).getResult().getId();

        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        var pageData = notificationRepository.findByRecipientId(userId, pageable);

        return PageResponse.<NotificationResponse>builder()
                .currentPage(page)
                .pageSize(pageData.getSize())
                .totalElements(pageData.getTotalElements())
                .totalPages(pageData.getTotalPages())
                .data(pageData.getContent().stream()
                        .map(notificationMapper::toResponse).toList())
                .build();
    }

    @Override
    public void markAsRead(String id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setStatus(NotificationStatus.READ);
            notificationRepository.save(n);
        });
    }
}