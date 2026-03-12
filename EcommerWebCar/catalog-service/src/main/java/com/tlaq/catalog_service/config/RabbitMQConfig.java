package com.tlaq.catalog_service.config;

import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.core.AmqpTemplate;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.amqp.core.Binding;


@Configuration
public class RabbitMQConfig {
    public static final String EXCHANGE = "x.order-exchange";
    public static final String INVENTORY_QUEUE = "q.inventory-update";
    public static final String INVENTORY_ROUTING_KEY = "routing.inventory";

    // 1. Tạo Exchange (Loại Topic cho linh hoạt) [cite: 2026-03-11]
    @Bean
    public TopicExchange orderExchange() {
        return new TopicExchange(EXCHANGE);
    }

    // 2. Tạo Queue để chứa tin nhắn trừ kho [cite: 2026-03-11]
    @Bean
    public Queue inventoryQueue() {
        return new Queue(INVENTORY_QUEUE, true); // true để tin nhắn không mất khi RabbitMQ restart
    }

    // 3. Binding: Nối Queue vào Exchange với một "mật mã" (Routing Key) [cite: 2026-03-11]
    @Bean
    public Binding inventoryBinding(Queue inventoryQueue, TopicExchange orderExchange) {
        return BindingBuilder.bind(inventoryQueue).to(orderExchange).with(INVENTORY_ROUTING_KEY);
    }

    // 4. Quan trọng: Cấu hình Converter để gửi Object dưới dạng JSON [cite: 2026-03-11]
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

}
