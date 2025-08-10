package com.tlaq.notification_service.controllers;


import com.tlaq.event.dto.NotificationEvent;
import com.tlaq.notification_service.dto.requests.EmailRequest;
import com.tlaq.notification_service.dto.requests.Recipient;
import com.tlaq.notification_service.dto.requests.SendEmailRequest;
import com.tlaq.notification_service.dto.requests.Sender;
import com.tlaq.notification_service.services.SendGridMailService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NotificationController {

    SendGridMailService sendGridMailService;

    @KafkaListener(topics = "notification-delivery")
    public void listenNotificationDelivery(NotificationEvent message) {
        EmailRequest emailRequest = EmailRequest.builder()
                .sender(Sender.builder()
                        .email("anhqui04062004@gmail.com")
                        .build())
            .subject(message.getSubject())
            .content(message.getBody())
                .to(Collections.singletonList(
                Recipient.builder()
                        .email(message.getRecipient())
                        .name("User")
                        .build()
                ))
                .build();
        sendGridMailService.sendMail(emailRequest);
    }
}
