package com.tlaq.notification_service.services;


import com.tlaq.notification_service.dto.requests.EmailRequest;
import com.tlaq.notification_service.dto.responses.EmailResponse;

public interface SendGridMailService {
    EmailResponse sendMail(EmailRequest emailRequest);
}
