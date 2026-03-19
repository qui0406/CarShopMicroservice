package com.tlaq.notification_service.services.impl;

import com.tlaq.notification_service.services.EmailService;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EmailServiceImpl implements EmailService {
    @Value("${app.sendgrid.api-key}")
    String sendGridApiKey;

    @Value("${app.sendgrid.from-email}")
    String fromEmail;

    @Override
    public void sendEmail(String to, String subject, String content) {

    }
}
