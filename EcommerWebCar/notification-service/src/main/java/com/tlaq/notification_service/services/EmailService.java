package com.tlaq.notification_service.services;

public interface EmailService {
    void sendEmail(String to, String subject, String content);
}
