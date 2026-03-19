package com.tlaq.ordering_service.listener;

import com.tlaq.ordering_service.config.RabbitMQConfig;
import com.tlaq.ordering_service.entity.Orders;
import com.tlaq.ordering_service.entity.enums.OrdersStatus;
import com.tlaq.ordering_service.repo.OrdersRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderTimeoutListener {

    private final OrdersRepository ordersRepository;
    private final RabbitTemplate rabbitTemplate;

    @RabbitListener(queues = RabbitMQConfig.ORDER_RESTORE_QUEUE)
    public void handleOrderTimeout(Map<String, Object> message) {
        String orderId = (String) message.get("orderId");

        Orders order = ordersRepository.findById(orderId).orElse(null);
        if (order == null) {
            log.warn("Không tìm thấy đơn hàng: {}", orderId);
            return;
        }

        if (order.getStatus() != OrdersStatus.PENDING) {
            log.info("Bỏ qua — đơn {} đã ở trạng thái: {}", orderId, order.getStatus());
            return;
        }

        // 1. Huỷ đơn hàng
        order.setStatus(OrdersStatus.CANCELLED);
        ordersRepository.save(order);
        log.info("Đã huỷ đơn hàng: {}", orderId);

        // 2. Gửi lệnh hoàn kho sang catalog-service
        Map<String, Object> rollbackMsg = new HashMap<>(message);
        rollbackMsg.put("rollback", true);

        log.info("Gửi lệnh hoàn kho - OrderId: {}", orderId);
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE,
                RabbitMQConfig.INVENTORY_ROLLBACK_RK,
                rollbackMsg
        );
    }
}