//package com.tlaq.listeners;
//
//import com.tlaq.configs.RabbitMQConfig;
//import com.tlaq.dto.event.OrderEvent;
//import com.tlaq.entity.enums.PaymentStatus;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.amqp.rabbit.annotation.RabbitListener;
//import org.springframework.amqp.rabbit.core.RabbitTemplate;
//import org.springframework.stereotype.Component;
//
//import java.math.BigDecimal;
//
//@Slf4j
//@Component
//@RequiredArgsConstructor
//public class PaymentListener {
//    private final RabbitTemplate rabbit;
//
//    @RabbitListener(queues = RabbitMQConfig.Q_ORDER_CREATED_PAYMENT)
//    public void handleOrderCreated(OrderEvent evt) {
//        log.info("📥 Received order.created: {}", evt);
//
//        boolean ok = processPayment(evt);
//
//
//        String rk = ok ? RabbitMQConfig.RK_PAYMENT_COMPLETED : RabbitMQConfig.RK_PAYMENT_FAILED;
//        OrderEvent out = OrderEvent.builder()
//                .orderId(evt.getOrderId())
//                .userId(evt.getUserId())
//                .totalAmount(evt.getTotalAmount())
//                .paymentStatus(ok ? PaymentStatus.SUCCESS : PaymentStatus.FAIL)
//                .build();
//
//        rabbit.convertAndSend(RabbitMQConfig.EXCHANGE, rk, out);
//        log.info("📤 Published {} for order {}", rk, evt.getOrderId());
//    }
//
//    private boolean processPayment(OrderEvent evt) {
//        // giả lập (ví dụ: totalAmount < 1_000_000 thì pass)
//        return evt.getTotalAmount() != null && evt.getTotalAmount().compareTo(new BigDecimal("1000000")) < 0;
//    }
//}