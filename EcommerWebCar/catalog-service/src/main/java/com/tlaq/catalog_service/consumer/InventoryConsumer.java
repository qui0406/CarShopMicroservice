package com.tlaq.catalog_service.consumer;

import com.tlaq.catalog_service.config.RabbitMQConfig;
import com.tlaq.catalog_service.service.InventoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class InventoryConsumer {

    private final InventoryService inventoryService;

    @RabbitListener(queues = RabbitMQConfig.INVENTORY_QUEUE)
    public void handleInventory(Map<String, Object> message) {
        String orderId = (String) message.get("orderId");
        Boolean isRollback = (Boolean) message.getOrDefault("rollback", false);

        try {
            List<Map<String, Object>> items = (List<Map<String, Object>>) message.get("items");

            if (Boolean.TRUE.equals(isRollback)) {
                log.info("[HOÀN KHO] OrderId: {}", orderId);
                inventoryService.restoreInventory(items);
                log.info("Hoàn kho thành công - OrderId: {}", orderId);
            } else {
                log.info("[TRỪ KHO] OrderId: {}", orderId);
                inventoryService.deduceStock(items);
                log.info("Trừ kho thành công - OrderId: {}", orderId);
            }
        } catch (Exception e) {
            log.error("Lỗi xử lý kho [rollback={}] OrderId: {} - {}", isRollback, orderId, e.getMessage());
        }
    }
}