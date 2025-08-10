package com.tlaq.notification_service.configs;

import com.sendgrid.SendGrid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;

public class SendGridConfig {
    @Bean
    public SendGrid sendGrid(@Value("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") String apiKey) {
        return new SendGrid(apiKey);
    }

}
