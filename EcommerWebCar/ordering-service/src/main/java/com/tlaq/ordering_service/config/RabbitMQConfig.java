package com.tlaq.ordering_service.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE                = "x.order-exchange";
    public static final String INVENTORY_QUEUE         = "q.inventory-update";
    public static final String INVENTORY_ROUTING_KEY   = "routing.inventory";
    public static final String INVENTORY_ROLLBACK_RK   = "routing.inventory.rollback";

    public static final String ORDER_TIMEOUT_EXCHANGE  = "x.order-timeout-exchange";
    public static final String ORDER_TIMEOUT_QUEUE     = "q.order-timeout";
    public static final String ORDER_TIMEOUT_RK        = "routing.order-timeout";

    public static final String ORDER_RESTORE_EXCHANGE  = "x.order-restore-exchange";
    public static final String ORDER_RESTORE_QUEUE     = "q.order-restore";
    public static final String ORDER_RESTORE_RK        = "routing.order-restore";

    public static final String ORDER_CONFIRM_RK    = "routing.order.confirm";
    public static final String ORDER_CONFIRM_QUEUE = "q.order-confirm";

    public static final String NOTIFICATION_EXCHANGE = "x.notification-exchange";
    public static final String NOTIFICATION_ROUTING_KEY = "routing.notification";

    // Exchange nhận lệnh trừ/hoàn kho
    @Bean
    public TopicExchange orderExchange() {
        return new TopicExchange(EXCHANGE);
    }

    @Bean
    public Queue inventoryQueue() {
        return new Queue(INVENTORY_QUEUE, true);
    }

    @Bean
    public Binding inventoryBinding() {
        return BindingBuilder.bind(inventoryQueue()).to(orderExchange()).with(INVENTORY_ROUTING_KEY);
    }

    @Bean
    public Binding inventoryRollbackBinding() {
        return BindingBuilder.bind(inventoryQueue()).to(orderExchange()).with(INVENTORY_ROLLBACK_RK);
    }

    // Queue chờ timeout — KHÔNG có consumer nào listen
    @Bean
    public TopicExchange orderTimeoutExchange() {
        return new TopicExchange(ORDER_TIMEOUT_EXCHANGE);
    }

    @Bean
    public Queue orderTimeoutQueue() {
        return QueueBuilder.durable(ORDER_TIMEOUT_QUEUE)
                .withArgument("x-message-ttl", 180000) // 3 phút (dành cho test)
               // .withArgument("x-message-ttl", 86400000) // 24 giờ (Thực tế)
                .withArgument("x-dead-letter-exchange", ORDER_RESTORE_EXCHANGE)
                .withArgument("x-dead-letter-routing-key", ORDER_RESTORE_RK)
                .build();
    }

    @Bean
    public Binding orderTimeoutBinding() {
        return BindingBuilder.bind(orderTimeoutQueue()).to(orderTimeoutExchange()).with(ORDER_TIMEOUT_RK);
    }

    // Queue nhận dead-letter sau timeout
    @Bean
    public TopicExchange orderRestoreExchange() {
        return new TopicExchange(ORDER_RESTORE_EXCHANGE);
    }

    @Bean
    public Queue orderRestoreQueue() {
        return new Queue(ORDER_RESTORE_QUEUE, true);
    }

    @Bean
    public Binding orderRestoreBinding() {
        return BindingBuilder.bind(orderRestoreQueue()).to(orderRestoreExchange()).with(ORDER_RESTORE_RK);
    }

    @Bean
    public Queue orderConfirmQueue() {
        return new Queue(ORDER_CONFIRM_QUEUE, true);
    }

    @Bean
    public Binding orderConfirmBinding() {
        return BindingBuilder.bind(orderConfirmQueue()).to(orderExchange()).with(ORDER_CONFIRM_RK);
    }

    public static final String ORDER_FAIL_RK    = "routing.order.fail";
    public static final String ORDER_FAIL_QUEUE = "q.order-fail";

    @Bean
    public Queue orderFailQueue() {
        return new Queue(ORDER_FAIL_QUEUE, true);
    }

    @Bean
    public Binding orderFailBinding() {
        return BindingBuilder.bind(orderFailQueue()).to(orderExchange()).with(ORDER_FAIL_RK);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}