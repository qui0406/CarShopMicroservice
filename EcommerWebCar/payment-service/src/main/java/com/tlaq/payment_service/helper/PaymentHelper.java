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
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PaymentHelper {
    RabbitTemplate rabbitTemplate;
    OrderingClient orderingClient;

    public void sendCarSoldUpdate(String orderId) {
        try {
            log.info("🚗 Đang gửi cập nhật xe ĐÃ BÁN cho đơn hàng {}...", orderId);
            var orderInfo = orderingClient.getOrder(orderId).getResult();

            if (orderInfo == null || orderInfo.getOrderItem() == null) return;

            List<Map<String, Object>> items = new java.util.ArrayList<>();
            var item = orderInfo.getOrderItem();
            Map<String, Object> itemMap = new HashMap<>();
            itemMap.put("carId", item.getCarId());
            itemMap.put("quantity", item.getQuantity());
            items.add(itemMap);

            Map<String, Object> soldMsg = new HashMap<>();
            soldMsg.put("orderId", orderId);
            soldMsg.put("type", "SOLD");
            soldMsg.put("items", items);

            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.EXCHANGE,
                    RabbitMQConfig.CAR_SOLD_RK,
                    soldMsg
            );
            log.info("✅ Đã gửi thông báo xe đã bán cho đơn hàng: {}", orderId);
        } catch (Exception e) {
            log.error("❌ Lỗi khi gửi thông báo xe đã bán cho đơn {}: {}", orderId, e.getMessage());
        }
    }

    public boolean isDepositReached(BigDecimal paidAmount) {
        BigDecimal minDeposit = new BigDecimal("20000000"); // 20 Triệu
        return paidAmount.compareTo(minDeposit) >= 0;
    }
}
