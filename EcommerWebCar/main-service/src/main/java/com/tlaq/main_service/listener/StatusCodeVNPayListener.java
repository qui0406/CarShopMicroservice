package com.tlaq.main_service.listener;

import com.tlaq.main_service.configs.RabbitMQConfig;
import com.tlaq.main_service.dto.event.ResVNPayEvent;
import com.tlaq.main_service.services.InventoryService;
import com.tlaq.main_service.services.OrdersService;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
@Data
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@AllArgsConstructor
public class StatusCodeVNPayListener {
    OrdersService ordersService;
    InventoryService inventoryService;

    @RabbitListener(queues = RabbitMQConfig.Q_PAYMENT_COMPLETED_ORDER)
    public void consumeStatusCodeVNPay(ResVNPayEvent event) {
        if(event.getCode().equals("00")){
            ordersService.markSuccess(event.getOrderId());
            inventoryService.updateInventoryAfterPay(event.getOrderId());
        }
    }

    @RabbitListener(queues = RabbitMQConfig.Q_PAYMENT_FAILED_ORDER)
    public void consumeStatusCodeVNPayFailed(ResVNPayEvent event) {
        ordersService.markFail(event.getOrderId());
    }
}
