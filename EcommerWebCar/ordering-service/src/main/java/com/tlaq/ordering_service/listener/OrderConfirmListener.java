package com.tlaq.ordering_service.listener;

import com.tlaq.event.dto.NotificationEvent;
import com.tlaq.ordering_service.config.RabbitMQConfig;
import com.tlaq.ordering_service.entity.Orders;
import com.tlaq.ordering_service.entity.enums.OrdersStatus;
import com.tlaq.ordering_service.repo.OrdersRepository;
import com.tlaq.ordering_service.repo.httpClient.IdentityClient;
import com.tlaq.ordering_service.service.OrderHistoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderConfirmListener {

    private final OrdersRepository ordersRepository;
    private final OrderHistoryService orderHistoryService;
    private final IdentityClient identityClient;
    private final RabbitTemplate rabbitTemplate;
    private final com.tlaq.ordering_service.repo.httpClient.CatalogClient catalogClient;

    @RabbitListener(queues = RabbitMQConfig.ORDER_CONFIRM_QUEUE)
    @Transactional // Bắt buộc phải có để đảm bảo toàn vẹn dữ liệu
    public void handleOrderConfirm(Map<String, Object> message) {
        String orderId = (String) message.get("orderId");
        log.info("Nhận xác nhận thanh toán - OrderId: {}", orderId);

        Orders order = ordersRepository.findById(orderId).orElse(null);
        if (order == null) {
            log.warn("Không tìm thấy đơn hàng: {}", orderId);
            return;
        }

        // Xử lý Idempotency: Bỏ qua nếu đơn đã thanh toán hoặc đã bị hủy
        if (order.getStatus() == OrdersStatus.PAID || order.getStatus() == OrdersStatus.CANCELLED) {
            log.info("Đơn hàng {} hiện đang ở trạng thái {}. Bỏ qua xử lý.", orderId, order.getStatus());
            return;
        }

        // Cập nhật trạng thái dựa trên trạng thái hiện tại
        if (order.getStatus() == OrdersStatus.WAITING_FOR_PAID) {
            order.setStatus(OrdersStatus.PAID);
            ordersRepository.save(order);

            orderHistoryService.saveHistory(
                    order,
                    OrdersStatus.PAID,
                    "Hệ thống (RabbitMQ) tự động xác nhận khách đã thanh toán toàn bộ",
                    "SYSTEM"
            );
            log.info("Đã cập nhật đơn hàng {} sang PAID", orderId);
            
            // Gửi email khi thanh toán thành công (Mua xe hoàn tất thủ tục)
            sendPurchaseCompleteEmail(order);
        } else {
            // Trường hợp PENDING hoặc các trạng thái khác (Idempotency check: bỏ qua nếu đã DEPOSITED)
            if (order.getStatus() == OrdersStatus.DEPOSITED) {
                log.info("Đơn hàng {} đã ở trạng thái DEPOSITED. Bỏ qua.", orderId);
                return;
            }
            order.setStatus(OrdersStatus.DEPOSITED);
            ordersRepository.save(order);

            // Mark car as deposited
            if (order.getOrderItem() != null && order.getOrderItem().getCarId() != null) {
                try {
                    catalogClient.markCarDeposited(order.getOrderItem().getCarId());
                } catch (Exception e) {
                    log.error("Lỗi khi cập nhật trạng thái đặt cọc cho xe {}: {}", order.getOrderItem().getCarId(), e.getMessage());
                }
            }

            orderHistoryService.saveHistory(
                    order,
                    OrdersStatus.DEPOSITED,
                    "Hệ thống (RabbitMQ) tự động xác nhận khách đã đặt cọc thành công",
                    "SYSTEM"
            );
            log.info("Đã cập nhật đơn hàng {} sang DEPOSITED", orderId);
            
            // Note: DEPOSIT_SUCCESS email is currently handled in OrderHistoryServiceImpl.handlePaymentSuccess, 
            // but if DEPOSITED is set here, maybe we should send it here too? 
            // Depending on the payment flow, if it goes through this listener for deposit, we should notify.
            // But the user's focus is that we have an email for "Mua xe hoàn tất thủ tục".
        }
    }

    private void sendPurchaseCompleteEmail(Orders order) {
        try {
            var ownerProfile = identityClient.getProfileById(order.getUserId()).getResult();
            if (ownerProfile != null && ownerProfile.getEmail() != null) {
                Map<String, Object> notiParam = Map.of(
                        "orderId", order.getId(),
                        "totalAmount", order.getTotalAmount()
                );
                NotificationEvent event = NotificationEvent.builder()
                        .type("PURCHASE_COMPLETE")
                        .channel("EMAIL")
                        .recipientId(order.getUserId())
                        .recipientEmail(ownerProfile.getEmail())
                        .subject("Thanh toán thành công - Mua xe hoàn tất thủ tục")
                        .body(String.format(
                                "Kính gửi Quý khách, <br/>" +
                                "Precision Motors xin thông báo đơn hàng <b>%s</b> của Quý khách đã được thanh toán đầy đủ. <br/>" +
                                "<b>Tất cả thủ tục mua bán xe đã hoàn tất!</b> <br/>" +
                                "Cảm ơn Quý khách đã tin tưởng và lựa chọn Precision Motors. Chúc Quý khách có những trải nghiệm tuyệt vời cùng chiếc xe mới của mình. <br/>" +
                                "Trân trọng cảm ơn!",
                                order.getId()))
                        .param(notiParam)
                        .build();

                rabbitTemplate.convertAndSend(
                        com.tlaq.ordering_service.config.RabbitMQConfig.NOTIFICATION_EXCHANGE,
                        com.tlaq.ordering_service.config.RabbitMQConfig.NOTIFICATION_ROUTING_KEY,
                        event);
                log.info("📧 Gửi Email thanh toán tất toán thành công - OrderId: {}", order.getId());
            }
        } catch (Exception e) {
            log.error("❌ Lỗi khi gửi email Thanh toán tất toán thành công - OrderId: {} - Error: {}", order.getId(), e.getMessage());
        }
    }
}