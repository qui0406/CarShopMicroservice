package com.tlaq.identity_service.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Cấu hình RabbitMQ cho identity-service.
 * Định nghĩa exchange + queue + routing key cho sự kiện đăng ký tài khoản.
 */
@Configuration
public class RabbitMQConfig {

    // Phải khớp 100% với notification-service RabbitMQConfig
    public static final String USER_REGISTERED_EXCHANGE    = "x.identity-exchange";
    public static final String USER_REGISTERED_ROUTING_KEY = "routing.user.registered";

    @Bean
    public TopicExchange identityExchange() {
        return new TopicExchange(USER_REGISTERED_EXCHANGE);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }
}
