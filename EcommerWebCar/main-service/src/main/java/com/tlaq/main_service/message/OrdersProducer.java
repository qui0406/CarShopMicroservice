//package com.tlaq.main_service.message;
//
//import com.tlaq.main_service.configs.RabbitMQConfig;
//import com.tlaq.main_service.dto.event.OrderEvent;
//import com.tlaq.main_service.dto.requests.OrdersRequest;
//import com.tlaq.main_service.entity.Orders;
//import com.tlaq.main_service.entity.enums.PaymentStatus;
//import lombok.AllArgsConstructor;
//import lombok.Data;
//import lombok.RequiredArgsConstructor;
//import org.springframework.amqp.AmqpException;
//import org.springframework.amqp.rabbit.core.RabbitTemplate;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//
//import java.math.BigDecimal;
//
//@Data
//@Service
//public class OrdersProducer {
//    private final RabbitTemplate rabbitTemplate;
//
//    public OrdersProducer(RabbitTemplate rabbitTemplate) {
//        this.rabbitTemplate = rabbitTemplate;
//    }
//
//    public void sendOrders(OrdersRequest request) {
//        OrderEvent orderEvent = new OrderEvent();
//        orderEvent.setProfileId(request.getProfileId());
//        orderEvent.setOrderId(request.getId());
//        orderEvent.setTotalAmount(request.getUnitPrice().multiply(new BigDecimal(request.getQuantity())));
//        orderEvent.setPaymentStatus(PaymentStatus.PENDING);
//        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, RabbitMQConfig.RK_ORDER_CREATED, orderEvent);
//    }
//}
