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
import com.tlaq.notification_service.services.SendGridMailService;
import lombok.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;

@Service
@Getter
@Setter
@Builder
@AllArgsConstructor
@RequiredArgsConstructor
public class SendGridMailServiceImpl implements SendGridMailService {

    private static final String CONTENT_TYPE_TEXT_PLAIN = "text/plain";

    private static final String KEY_X_MOCK = "X-Mock";

    private static final String SEND_GRID_ENDPOINT_SEND_EMAIL = "mail/send";

    @Value("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")
    private String sendGridApiKey;

    @Value("anhqui04062004@gmail.com")
    private String sendGridFromEmail;

    @Value("ecommer_car")
    private String sendGridFromName;

    @Override
    public EmailResponse sendMail(EmailRequest emailRequest) {
        Mail mail = buildMailToSend(emailRequest);
        send(mail);
        return null;
    }

    private void send(Mail mail) {
        SendGrid sg = new SendGrid(sendGridApiKey);
        sg.addRequestHeader(KEY_X_MOCK, "true");

        Request request = new Request();
        try {
            request.setMethod(Method.POST);
            request.setEndpoint(SEND_GRID_ENDPOINT_SEND_EMAIL);
            request.setBody(mail.build());
            Response response = sg.api(request);
            System.out.println(response.getStatusCode());
            System.out.println(response.getBody());
        } catch (IOException ex) {
            ex.printStackTrace();
        }
    }

    private Mail buildMailToSend(EmailRequest emailRequest) {
        Mail mail = new Mail();

        Email fromEmail = new Email();
        fromEmail.setName(sendGridFromName);
        fromEmail.setEmail(sendGridFromEmail);

        mail.setFrom(fromEmail);

        mail.setSubject(emailRequest.getSubject());

        Personalization personalization = new Personalization();

        List<Recipient> toRecipients = emailRequest.getTo();

        if (toRecipients != null) {
            for (Recipient recipient : toRecipients) {
                Email to = new Email(recipient.getEmail(), recipient.getName());  // Email trước, Name sau!
                personalization.addTo(to);
            }
        }
        mail.addPersonalization(personalization);

        Content content = new Content();
        content.setType(CONTENT_TYPE_TEXT_PLAIN);
        content.setValue(emailRequest.getContent().toString());
        mail.addContent(content);
        return mail;
    }

}
