package com.tlaq.main_service.listener;

import com.tlaq.main_service.configs.RabbitMQConfig;
import com.tlaq.main_service.services.RedisService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class CarCacheInvalidationListener {
    private final RedisService redisService;

    private static final String CAR_CACHE_PREFIX = "cars:";
    private static final String CAR_DETAIL_CACHE_PREFIX = "car:details:";
    private static final String CAR_FILTER_CACHE_PREFIX = "cars:filter:";

    @RabbitListener(queues = RabbitMQConfig.Q_CAR_UPDATED)
    public void handleCarUpdated(Map<String, Object> message) {
        try {
            String action = (String) message.get("action");
            String carId = (String) message.get("carId");

            log.info("Received car update message - Action: {}, CarId: {}", action, carId);

            // Always invalidate car listing and filter caches when any car is modified
            invalidateCarListingCaches();

            // For UPDATE and DELETE actions, also invalidate the specific car detail cache
            if (("UPDATE".equals(action) || "DELETE".equals(action)) && carId != null) {
                invalidateCarDetailCache(carId);
            }

            log.info("Successfully processed car cache invalidation for action: {} and carId: {}",
                    action, carId);

        } catch (Exception e) {
            log.error("Failed to process car cache invalidation message: {}", message, e);
        }
    }

    private void invalidateCarListingCaches() {
        try {
//            // Clear all car listing caches (pagination)
//            long deletedListingKeys = redisService.deleteKeysByPattern(CAR_CACHE_PREFIX + "*");
//
//            // Clear all filter caches
//            long deletedFilterKeys = redisService.deleteKeysByPattern(CAR_FILTER_CACHE_PREFIX + "*");

//            log.info("Invalidated {} car listing cache keys and {} filter cache keys",
//                    deletedListingKeys, deletedFilterKeys);

        } catch (Exception e) {
            log.error("Failed to invalidate car listing caches", e);
        }
    }

    private void invalidateCarDetailCache(String carId) {
        try {
            String cacheKey = CAR_DETAIL_CACHE_PREFIX + carId;
            if (redisService.hasKey(cacheKey)) {
                redisService.deleteKey(cacheKey);
                log.info("Invalidated car detail cache for carId: {}", carId);
            } else {
                log.debug("Car detail cache key not found for carId: {}", carId);
            }
        } catch (Exception e) {
            log.error("Failed to invalidate car detail cache for carId: {}", carId, e);
        }
    }

    /**
     * Health check method to verify the listener is working
     */
    @RabbitListener(queues = "#{T(com.tlaq.main_service.configs.RabbitMQConfig).Q_CAR_UPDATED}")
    public void handleHealthCheck(Map<String, Object> message) {
        if ("HEALTH_CHECK".equals(message.get("action"))) {
            log.info("Car cache invalidation listener is healthy and responding");
        }
    }

}
