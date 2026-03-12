package com.tlaq.catalog_service.consumer;

import com.tlaq.catalog_service.repo.CarRepository;
import com.tlaq.catalog_service.repo.InventoryRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.AmqpTemplate;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class InventoryConsumer {

    private final InventoryRepository inventoryRepository;

    @RabbitListener(queues = "q.inventory-update")
    @Transactional
    public void handleInventoryUpdate(InventoryUpdateMessage message) {
        log.info("Nhận tin nhắn trừ kho: CarID {}, Số lượng {}", message.getCarId(), message.getQuantity());
        inventoryRepository.reduceStock(message.getCarId(), message.getQuantity());
    }
}