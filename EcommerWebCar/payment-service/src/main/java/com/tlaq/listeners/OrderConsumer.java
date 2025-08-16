package com.tlaq.listeners;

import com.tlaq.configs.RabbitMQConfig;
import com.tlaq.dto.event.OrderEvent;
import com.tlaq.dto.request.PaymentRequest;
import com.tlaq.services.PaymentService;
import lombok.Data;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Data
@Service
public class OrderConsumer {
    private final PaymentService paymentService;

    public OrderConsumer(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @RabbitListener(queues = RabbitMQConfig.Q_ORDER_CREATED_PAYMENT)
    public void consumeOrders(OrderEvent orderEvent) {
        PaymentRequest request = new PaymentRequest();
        request.setTxnRef(orderEvent.getOrderId());
        request.setAmount(orderEvent.getTotalAmount());
        request.setIpAddress(orderEvent.getPaymentStatus());
        paymentService.init(request);
    }

}

