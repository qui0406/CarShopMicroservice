package com.tlaq.ordering_service.job;

import com.tlaq.event.dto.NotificationEvent;
import com.tlaq.ordering_service.config.RabbitMQConfig;
import com.tlaq.ordering_service.entity.Orders;
import com.tlaq.ordering_service.entity.enums.OrdersStatus;
import com.tlaq.ordering_service.entity.enums.OrdersType;
import com.tlaq.ordering_service.repo.OrdersRepository;
import com.tlaq.ordering_service.repo.httpClient.IdentityClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderCleanupJob {

    private final OrdersRepository ordersRepository;
    private final RabbitTemplate rabbitTemplate;
    private final IdentityClient identityClient;

    // Chạy vào 2h sáng mỗi ngày
    @Scheduled(cron = "0 0 2 * * ?")
    public void cleanupStaleDeposits() {
        log.info("CronJob: Bắt đầu quét các đơn đặt cọc quá hạn...");

        // Tìm các đơn đặt cọc (DEPOSIT) đã PAID nhưng quá 7 ngày chưa thanh toán nốt
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        List<Orders> staleOrders = ordersRepository.findByStatusAndTypeAndUpdatedAtBefore(
                OrdersStatus.DEPOSITED,
                OrdersType.DEPOSIT,
                sevenDaysAgo
        );

        if (staleOrders.isEmpty()) {
            log.info("CronJob: Không tìm thấy đơn cọc quá hạn nào.");
            return;
        }

        for (Orders order : staleOrders) {
            log.info("CronJob: Huỷ đơn cọc quá hạn (trên 7 ngày) - OrderId: {}", order.getId());
            order.setStatus(OrdersStatus.CANCELLED);
            order.setNote("Hệ thống tự động huỷ do đơn cọc đã quá 7 ngày không thanh toán hoàn tất.");
            ordersRepository.save(order);

            // Gửi lệnh hoàn kho sang catalog-service
            Map<String, Object> rollbackMsg = new HashMap<>();
            rollbackMsg.put("orderId", order.getId());
            rollbackMsg.put("rollback", true);
            List<Map<String, Object>> items = order.getOrderItems().stream().map(item -> {
                Map<String, Object> i = new HashMap<>();
                i.put("carId", item.getCarId());
                i.put("quantity", item.getQuantity());
                return i;
            }).toList();
            rollbackMsg.put("items", items);

            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.EXCHANGE,
                    RabbitMQConfig.INVENTORY_ROLLBACK_RK,
                    rollbackMsg
            );
            log.info("CronJob: Đã gửi lệnh hoàn kho cho OrderId: {}", order.getId());

            // 📧 Gửi Email thông báo hủy đơn cọc quá hạn
            try {
                var ownerProfile = identityClient.getProfileById(order.getUserId()).getResult();
                if (ownerProfile != null && ownerProfile.getEmail() != null) {
                    Map<String, Object> notiParam = new HashMap<>();
                    notiParam.put("orderId", order.getId());

                    NotificationEvent depositExpiredEvent = NotificationEvent.builder()
                            .type("ORDER_DEPOSIT_EXPIRED")
                            .channel("EMAIL")
                            .recipientId(order.getUserId())
                            .recipientEmail(ownerProfile.getEmail())
                            .subject("Đơn đặt cọc hết hạn - Mã đơn: " + order.getId())
                            .body("Đơn hàng " + order.getId() + " của bạn đã bị hủy tự động do đã quá 7 ngày " +
                                  "kể từ khi đặt cọc mà chưa hoàn tất thanh toán. " +
                                  "Nếu bạn vẫn có nhu cầu mua xe, vui lòng liên hệ cửa hàng để được hỗ trợ.")
                            .param(notiParam)
                            .build();

                    rabbitTemplate.convertAndSend(
                            RabbitMQConfig.NOTIFICATION_EXCHANGE,
                            RabbitMQConfig.NOTIFICATION_ROUTING_KEY,
                            depositExpiredEvent
                    );
                    log.info("📧 Gửi Email hủy cọc quá hạn - OrderId: {}", order.getId());
                }
            } catch (Exception e) {
                log.error("Lỗi gửi notification hủy cọc quá hạn OrderId {}: {}", order.getId(), e.getMessage());
            }
        }

        log.info("CronJob: Quét và xử lý thành công {} đơn quá hạn.", staleOrders.size());
    }
}
