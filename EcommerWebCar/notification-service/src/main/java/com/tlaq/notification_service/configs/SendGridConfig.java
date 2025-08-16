package com.tlaq.notification_service.configs;

import com.sendgrid.SendGrid;
import feign.RequestInterceptor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SendGridConfig {
    @Bean
    public SendGrid sendGrid(@Value("${spring.send-grid.api-key}") String apiKey) {
        return new SendGrid(apiKey);
    }
}
