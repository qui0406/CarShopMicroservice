package com.tlaq.payment_service.configs;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {
    public static final String EXCHANGE = "saga.exchange";

    public static final String Q_ORDER_CREATED_PAYMENT = "order.created.payment";
    public static final String Q_PAYMENT_COMPLETED_ORDER = "payment.completed.order";
    public static final String Q_PAYMENT_FAILED_ORDER    = "payment.failed.order";
    public static final String Q_PAYMENT_FAILED_CASH = "fail.cash";

    // routing keys
    public static final String RK_ORDER_CREATED     = "order.created";
    public static final String RK_PAYMENT_COMPLETED = "payment.completed";
    public static final String RK_PAYMENT_FAILED    = "payment.failed";

    public static final String RK_PAYMENT_FAILED_CASH = "payment.failed.cash";

    @Bean TopicExchange exchange() { return new TopicExchange(EXCHANGE, true, false); }

    @Bean
    Queue qOrderCreatedPayment() {
        return new Queue(Q_ORDER_CREATED_PAYMENT, true);
    }

    @Bean
    Queue qPaymentCompletedOrder() {
        return new Queue(Q_PAYMENT_COMPLETED_ORDER, true);
    }

    @Bean
    Queue qPaymentFailedOrder() {
        return new Queue(Q_PAYMENT_FAILED_ORDER, true);
    }

    @Bean
    Queue qFailPaymentCash() {
        return new Queue(Q_PAYMENT_FAILED_CASH, true);
    }

    @Bean
    Binding bOrderCreatedPayment(TopicExchange exchange) {
        return BindingBuilder.bind(qOrderCreatedPayment())
                .to(exchange)
                .with(RK_ORDER_CREATED);
    }

    @Bean
    Binding bPaymentCompletedOrder(TopicExchange ex) {
        return BindingBuilder.bind(qPaymentCompletedOrder())
                .to(ex)
                .with(RK_PAYMENT_COMPLETED);
    }

    @Bean
    Binding bPaymentFailedOrder(TopicExchange ex) {
        return BindingBuilder.bind(qPaymentFailedOrder())
                .to(ex)
                .with(RK_PAYMENT_FAILED);
    }

    @Bean
    Binding bFailedPayment(TopicExchange exchange) {
        return BindingBuilder.bind(qFailPaymentCash())
                .to(exchange)
                .with(RK_PAYMENT_FAILED_CASH);
    }


    @Bean public Jackson2JsonMessageConverter jackson2JsonMessageConverter() { return new Jackson2JsonMessageConverter(); }

    @Bean public RabbitTemplate rabbitTemplate(ConnectionFactory cf) {
        RabbitTemplate t = new RabbitTemplate(cf);
        t.setMessageConverter(jackson2JsonMessageConverter());
        return t;
    }
}
