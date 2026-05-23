package com.tlaq.catalog_service.config;

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
    public static final String ORDER_FAIL_RK           = "routing.order.fail";
    public static final String CAR_SOLD_RK             = "routing.car-sold";

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

    @Bean
    public Binding carSoldBinding() {
        return BindingBuilder.bind(inventoryQueue()).to(orderExchange()).with(CAR_SOLD_RK);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}