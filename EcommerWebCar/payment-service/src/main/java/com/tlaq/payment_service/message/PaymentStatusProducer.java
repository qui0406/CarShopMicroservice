package com.tlaq.payment_service.message;

import com.tlaq.payment_service.configs.RabbitMQConfig;
import com.tlaq.payment_service.dto.event.ResVNPayEvent;
import lombok.Data;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
@Data
public class PaymentStatusProducer {
    private final RabbitTemplate rabbitTemplate;

    public PaymentStatusProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void sendStatusCodeVNPay(ResVNPayEvent event) {
        if(event.getCode().equals("00")) {
            rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, RabbitMQConfig.RK_PAYMENT_COMPLETED, event);
        }else{
            rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, RabbitMQConfig.RK_PAYMENT_FAILED, event);
        }
    }

    public void failPaymentCash(ResVNPayEvent event){
        if(event.getCode().equals("97")) {
            rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, RabbitMQConfig.Q_PAYMENT_FAILED_CASH);
        }
    }
}
