package com.tlaq.notification_service.configs;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // 1. Định nghĩa các hằng số (Dùng chung cho cả Controller và Consumer)
    public static final String NOTIFICATION_QUEUE = "q.notification";
    public static final String NOTIFICATION_EXCHANGE = "x.notification-exchange";
    public static final String NOTIFICATION_ROUTING_KEY = "routing.notification";

    // 2. Khai báo Queue
    @Bean
    public Queue notificationQueue() {
        return new Queue(NOTIFICATION_QUEUE, true); // true = durable (không mất tin nhắn khi restart Rabbit)
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

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}