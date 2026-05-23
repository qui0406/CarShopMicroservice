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

    @org.springframework.context.annotation.Lazy
    private final InventoryService inventoryService;
    private final org.springframework.amqp.rabbit.core.RabbitTemplate rabbitTemplate;

    @RabbitListener(queues = RabbitMQConfig.INVENTORY_QUEUE)
    public void handleInventory(Map<String, Object> message) {
        String orderId = (String) message.get("orderId");
        Boolean isRollback = (Boolean) message.getOrDefault("rollback", false);
        String type = (String) message.getOrDefault("type", "");

        try {
            List<Map<String, Object>> items = (List<Map<String, Object>>) message.get("items");

            if ("SOLD".equals(type)) {
                log.info("[XE ĐÃ BÁN] OrderId: {}", orderId);
                inventoryService.markAsSold(items);
                log.info("Đánh dấu xe đã bán thành công - OrderId: {}", orderId);
            } else if (Boolean.TRUE.equals(isRollback)) {
                log.info("[HOÀN ĐẶT CỌC] OrderId: {}", orderId);
                inventoryService.restoreInventory(items);
                log.info("Hoàn trạng thái đặt cọc thành công - OrderId: {}", orderId);
            } else {
                log.info("[ĐẶT CỌC] OrderId: {}", orderId);
                inventoryService.deduceStock(items);
                log.info("Đánh dấu xe đặt cọc thành công - OrderId: {}", orderId);
            }
        } catch (Exception e) {
            log.error("Lỗi xử lý cập nhật xe [type={}, rollback={}] OrderId: {} - {}", type, isRollback, orderId, e.getMessage());
            
            // SAGA Compensation: Gửi lệnh báo lỗi sang ordering-service để huỷ đơn
            if (!Boolean.TRUE.equals(isRollback) && !"SOLD".equals(type) && orderId != null) {
                Map<String, Object> failMsg = new java.util.HashMap<>();
                failMsg.put("orderId", orderId);
                failMsg.put("reason", "Lỗi xử lý cập nhật xe: " + e.getMessage());
                
                log.info("SAGA: Gửi yêu cầu huỷ đơn hàng do lỗi - OrderId: {}", orderId);
                rabbitTemplate.convertAndSend(
                        RabbitMQConfig.EXCHANGE,
                        RabbitMQConfig.ORDER_FAIL_RK,
                        failMsg
                );
            }
        }
    }
}