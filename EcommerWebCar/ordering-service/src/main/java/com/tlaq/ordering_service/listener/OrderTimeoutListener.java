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
    private final com.tlaq.ordering_service.repo.httpClient.CatalogClient catalogClient;

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
        log.info("Đã huỷ đơn hàng do quá hạn: {}", orderId);

        // 2. Hủy giữ xe
        if (order.getOrderItem() != null && order.getOrderItem().getCarId() != null) {
            try {
                catalogClient.unmarkCarDeposited(order.getOrderItem().getCarId());
            } catch (Exception e) {
                log.error("Lỗi khi hủy giữ xe {}: {}", order.getOrderItem().getCarId(), e.getMessage());
            }
        }
    }
}