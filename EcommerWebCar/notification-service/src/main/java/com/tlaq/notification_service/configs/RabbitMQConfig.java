package com.tlaq.notification_service.configs;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // ── Notification chung ──────────────────────────────────────────────────
    public static final String NOTIFICATION_QUEUE       = "q.notification";
    public static final String NOTIFICATION_EXCHANGE    = "x.notification-exchange";
    public static final String NOTIFICATION_ROUTING_KEY = "routing.notification";

    // ── User Registered (từ identity-service) ──────────────────────────────
    public static final String USER_REGISTERED_QUEUE       = "q.user-registered";
    public static final String USER_REGISTERED_EXCHANGE    = "x.identity-exchange";
    public static final String USER_REGISTERED_ROUTING_KEY = "routing.user.registered";

    // ── Beans: notification chung ───────────────────────────────────────────
    @Bean
    public Queue notificationQueue() {
        return new Queue(NOTIFICATION_QUEUE, true);
    }

    @Bean
    public TopicExchange notificationExchange() {
        return new TopicExchange(NOTIFICATION_EXCHANGE);
    }

    @Bean
    public Binding notificationBinding(Queue notificationQueue, TopicExchange notificationExchange) {
        return BindingBuilder.bind(notificationQueue)
                .to(notificationExchange)
                .with(NOTIFICATION_ROUTING_KEY);
    }

    // ── Beans: user-registered ──────────────────────────────────────────────
    @Bean
    public Queue userRegisteredQueue() {
        return new Queue(USER_REGISTERED_QUEUE, true);
    }

    @Bean
    public TopicExchange identityExchange() {
        return new TopicExchange(USER_REGISTERED_EXCHANGE);
    }

    @Bean
    public Binding userRegisteredBinding(Queue userRegisteredQueue, TopicExchange identityExchange) {
        return BindingBuilder.bind(userRegisteredQueue)
                .to(identityExchange)
                .with(USER_REGISTERED_ROUTING_KEY);
    }

    // ── Shared converter & template ─────────────────────────────────────────
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