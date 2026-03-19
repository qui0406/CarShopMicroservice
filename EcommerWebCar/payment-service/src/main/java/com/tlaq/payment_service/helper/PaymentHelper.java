package com.tlaq.payment_service.helper;

import com.tlaq.payment_service.configs.RabbitMQConfig;
import com.tlaq.payment_service.repository.httpClient.OrderingClient;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PaymentHelper {
    RabbitTemplate rabbitTemplate;
    OrderingClient orderingClient;

    public void sendInventoryUpdate(String orderId) {
        try {
            log.info("🛒 Đang lấy thông tin đơn hàng {} để cập nhật kho...", orderId);
            var orderInfo = orderingClient.getOrder(orderId).getResult();

            if (orderInfo == null || orderInfo.getOrderItems() == null) return;

            orderInfo.getOrderItems().forEach(item -> {
                Map<String, Object> message = new HashMap<>();
                message.put("carId", item.getCarId());
                message.put("quantity", item.getQuantity());
                message.put("type", "DECREASE");

                rabbitTemplate.convertAndSend(
                        RabbitMQConfig.EXCHANGE,
                        RabbitMQConfig.INVENTORY_ROUTING_KEY,
                        message
                );
            });
            log.info("✅ Đã gửi yêu cầu trừ kho thành công cho đơn hàng: {}", orderId);
        } catch (Exception e) {
            log.error("❌ Lỗi khi tự động cập nhật kho cho đơn {}: {}", orderId, e.getMessage());
        }
    }

    public boolean isDepositReached(BigDecimal paidAmount) {
        BigDecimal minDeposit = new BigDecimal("20000000"); // 20 Triệu
        return paidAmount.compareTo(minDeposit) >= 0;
    }
}
