package com.tlaq.notification_service.services.impl;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import com.sendgrid.helpers.mail.objects.Personalization;
import com.tlaq.notification_service.dto.requests.EmailRequest;
import com.tlaq.notification_service.dto.requests.Recipient;
import com.tlaq.notification_service.dto.responses.EmailResponse;
import com.tlaq.notification_service.services.EmailService;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
@RequiredArgsConstructor  // Lombok inject qua constructor, xóa @Builder/@Getter/@Setter thừa
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EmailServiceImpl implements EmailService {
    @Value("${spring.sendgrid.api-key}")
    String sendGridApiKey;

    @Value("${spring.sendgrid.from-email}")
    String fromEmail;

    @Value("${spring.sendgrid.from-name:TLAQ Notification}")
    String fromName;

    @Override
    public EmailResponse sendEmail(EmailRequest emailRequest) {
        Mail mail = buildMail(emailRequest);
        return sendRequest(mail);
    }

    private Mail buildMail(EmailRequest emailRequest) {
        Mail mail = new Mail();
        mail.setFrom(new Email(fromEmail, fromName));
        mail.setSubject(emailRequest.getSubject());

        Personalization personalization = new Personalization();
        if (emailRequest.getTo() != null) {
            for (Recipient recipient : emailRequest.getTo()) {
                personalization.addTo(new Email(recipient.getEmail(), recipient.getName()));
            }
        }
        mail.addPersonalization(personalization);

        Content content = new Content("text/html", emailRequest.getContent());
        mail.addContent(content);

        return mail;
    }

    private EmailResponse sendRequest(Mail mail) {
        log.info("🔑 Using SendGrid API key: {}",
                sendGridApiKey);

        SendGrid sg = new SendGrid(sendGridApiKey);
        Request request = new Request();

        try {
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());

            Response response = sg.api(request);
            log.info("SendGrid response status: {}", response.getStatusCode());

            if (response.getStatusCode() >= 200 && response.getStatusCode() < 300) {
                return EmailResponse.builder()
                        .message("Email sent successfully!")
                        .build();
            }
        } catch (IOException ex) {
            log.error("Error sending email via SendGrid: {}", ex.getMessage());
        }

        return EmailResponse.builder().message("Failed to send email").build();
    }

}
