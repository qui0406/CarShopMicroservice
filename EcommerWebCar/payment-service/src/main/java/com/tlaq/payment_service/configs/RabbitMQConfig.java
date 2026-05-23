package com.tlaq.payment_service.configs;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE              = "x.order-exchange";
    public static final String CAR_SOLD_RK           = "routing.car-sold";
    public static final String ORDER_CONFIRM_RK      = "routing.order.confirm";
    public static final String ORDER_CONFIRM_QUEUE   = "q.order-confirm";

    // Notification
    public static final String NOTIFICATION_EXCHANGE = "x.notification-exchange";
    public static final String NOTIFICATION_ROUTING_KEY = "routing.notification";

    @Bean
    public TopicExchange orderExchange() {
        return new TopicExchange(EXCHANGE);
    }

    @Bean
    public Queue orderConfirmQueue() {
        return new Queue(ORDER_CONFIRM_QUEUE, true);
    }

    @Bean
    public Binding orderConfirmBinding() {
        return BindingBuilder.bind(orderConfirmQueue()).to(orderExchange()).with(ORDER_CONFIRM_RK);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}