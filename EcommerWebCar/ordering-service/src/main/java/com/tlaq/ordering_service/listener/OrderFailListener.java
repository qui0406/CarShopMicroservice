package com.tlaq.ordering_service.listener;

import com.tlaq.event.dto.NotificationEvent;
import com.tlaq.ordering_service.config.RabbitMQConfig;
import com.tlaq.ordering_service.entity.Orders;
import com.tlaq.ordering_service.entity.enums.OrdersStatus;
import com.tlaq.ordering_service.repo.OrdersRepository;
import com.tlaq.ordering_service.repo.httpClient.IdentityClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderFailListener {

    private final OrdersRepository ordersRepository;
    private final IdentityClient identityClient;
    private final RabbitTemplate rabbitTemplate;

    @RabbitListener(queues = RabbitMQConfig.ORDER_FAIL_QUEUE)
    public void handleOrderFail(Map<String, Object> message) {
        String orderId = (String) message.get("orderId");
        String reason = (String) message.get("reason");

        Orders order = ordersRepository.findById(orderId).orElse(null);
        if (order == null) return;

        // Chỉ huỷ nếu đơn hàng chưa hoàn thành giao
        if (order.getStatus() == OrdersStatus.PENDING
                || order.getStatus() == OrdersStatus.WAITING_FOR_PAY
                || order.getStatus() == OrdersStatus.DEPOSITED
                || order.getStatus() == OrdersStatus.PAID) {

            order.setStatus(OrdersStatus.CANCELLED);
            order.setNote("Hệ thống huỷ tự động: " + reason);
            ordersRepository.save(order);
            log.info("SAGA: Đã huỷ đơn hàng do lỗi kho: {}", orderId);

            // 📧 Gửi Email thông báo SAGA hủy đơn do lỗi kho
            try {
                var ownerProfile = identityClient.getProfileById(order.getUserId()).getResult();
                if (ownerProfile != null && ownerProfile.getEmail() != null) {
                    Map<String, Object> notiParam = new HashMap<>();
                    notiParam.put("orderId", orderId);
                    notiParam.put("reason", reason);

                    NotificationEvent sagaCancelledEvent = NotificationEvent.builder()
                            .type("ORDER_CANCELLED_SYSTEM")
                            .channel("EMAIL")
                            .recipientId(order.getUserId())
                            .recipientEmail(ownerProfile.getEmail())
                            .subject("Đơn hàng đã bị huỷ tự động - Mã đơn: " + orderId)
                            .body("Đơn hàng " + orderId + " của bạn đã bị hệ thống tự động hủy do lỗi xử lý kho. " +
                                  "Lý do: " + reason + ". " +
                                  "Chúng tôi xin lỗi vì sự bất tiện này. Vui lòng liên hệ cửa hàng để được hỗ trợ.")
                            .param(notiParam)
                            .build();

                    rabbitTemplate.convertAndSend(
                            RabbitMQConfig.NOTIFICATION_EXCHANGE,
                            RabbitMQConfig.NOTIFICATION_ROUTING_KEY,
                            sagaCancelledEvent
                    );
                    log.info("📧 Gửi Email SAGA hủy đơn do lỗi kho - OrderId: {}", orderId);
                }
            } catch (Exception e) {
                log.error("Lỗi gửi notification SAGA: {}", e.getMessage());
            }
        }
    }
}
