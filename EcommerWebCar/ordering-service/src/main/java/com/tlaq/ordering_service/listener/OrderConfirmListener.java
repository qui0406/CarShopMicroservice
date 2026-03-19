package com.tlaq.ordering_service.listener;

import com.tlaq.ordering_service.config.RabbitMQConfig;
import com.tlaq.ordering_service.entity.Orders;
import com.tlaq.ordering_service.entity.enums.OrdersStatus;
import com.tlaq.ordering_service.repo.OrdersRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderConfirmListener {

    private final OrdersRepository ordersRepository;

    @RabbitListener(queues = RabbitMQConfig.ORDER_CONFIRM_QUEUE)
    public void handleOrderConfirm(Map<String, Object> message) {
        String orderId = (String) message.get("orderId");
        log.info("Nhận xác nhận thanh toán - OrderId: {}", orderId);

        Orders order = ordersRepository.findById(orderId).orElse(null);
        if (order == null) {
            log.warn("Không tìm thấy đơn hàng: {}", orderId);
            return;
        }

        order.setStatus(OrdersStatus.WAITING_FOR_PAY);
        ordersRepository.save(order);
        log.info("Đã cập nhật đơn hàng {} sang CONFIRMED", orderId);
    }
}