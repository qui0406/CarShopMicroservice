package com.tlaq.ordering_service.service.impl;

import com.tlaq.event.dto.NotificationEvent;
import com.tlaq.ordering_service.config.RabbitMQConfig;
import com.tlaq.ordering_service.dto.response.OrdersHistoryResponse;
import com.tlaq.ordering_service.entity.Orders;
import com.tlaq.ordering_service.entity.OrdersHistory;
import com.tlaq.ordering_service.entity.enums.OrdersStatus;
import com.tlaq.ordering_service.exceptions.AppException;
import com.tlaq.ordering_service.exceptions.ErrorCode;
import com.tlaq.ordering_service.mapper.OrdersMapper;
import com.tlaq.ordering_service.repo.OrdersHistoryRepository;
import com.tlaq.ordering_service.repo.OrdersRepository;
import com.tlaq.ordering_service.repo.httpClient.IdentityClient;
import com.tlaq.ordering_service.service.OrderHistoryService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderHistoryServiceImpl implements OrderHistoryService {
    OrdersHistoryRepository ordersHistoryRepository;
    OrdersMapper ordersMapper;
    OrdersRepository ordersRepository;
    IdentityClient identityClient;
    RabbitTemplate rabbitTemplate;

    @Override
    public void saveHistory(Orders order, OrdersStatus status, String note, String actorId) {
        OrdersHistory history = OrdersHistory.builder()
                .order(order)
                .status(status)
                .note(note)
                .updatedBy(actorId)
                .build();

        ordersHistoryRepository.save(history);
    }

    @Override
    public List<OrdersHistoryResponse> getOrderTimeline(String orderId) {
        return ordersHistoryRepository.findByOrderIdOrderByCreatedAtAsc(orderId).stream()
                .map(ordersMapper::toOrdersHistoryResponse).toList();
    }

    @Override
    public void handlePaymentSuccess(String orderId) {
        // 1. Tìm đơn hàng
        Orders order = ordersRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        // 2. Cập nhật trạng thái đơn hàng (Ví dụ: sau khi cọc/thanh toán xong thì xác nhận đơn)
        // Nếu Quí có trạng thái DEPOSITED (Đã đặt cọc) thì dùng, không thì CONFIRMED
        order.setStatus(OrdersStatus.DEPOSITED);
        ordersRepository.save(order);

        // 3. Ghi lại lịch sử (Timeline)
        // actorId ở đây có thể để là "SYSTEM" vì đây là hành động tự động từ hệ thống
        String note = "Hệ thống xác nhận thanh toán thành công. Đơn hàng chuyển sang trạng thái Đã đặt cọc.";
        saveHistory(order, OrdersStatus.DEPOSITED, note, "SYSTEM");

        log.info("✅ Đã cập nhật trạng thái và lịch sử cho đơn hàng: {}", orderId);

        // 4. Gửi Email thông báo Đặt cọc thành công
        sendDepositSuccessEmail(order);
    }

    private void sendDepositSuccessEmail(Orders order) {
        try {
            var ownerProfile = identityClient.getProfileById(order.getUserId()).getResult();
            if (ownerProfile != null && ownerProfile.getEmail() != null) {
                Map<String, Object> notiParam = Map.of(
                        "orderId", order.getId(),
                        "totalAmount", order.getTotalAmount()
                );
                NotificationEvent event = NotificationEvent.builder()
                        .type("DEPOSIT_SUCCESS")
                        .channel("EMAIL")
                        .recipientId(order.getUserId())
                        .recipientEmail(ownerProfile.getEmail())
                        .subject("Xác nhận đặt cọc thành công - Mã đơn: " + order.getId())
                        .body(String.format(
                                "Xin chào, <br/>" +
                                "Precision Motors xin xác nhận bạn đã <b>đặt cọc thành công</b> cho đơn hàng <b>%s</b>. <br/>" +
                                "Đơn hàng của bạn đã được ghi nhận trên hệ thống. <br/>" +
                                "Vui lòng đến trực tiếp showroom của chúng tôi để tiến hành ký hợp đồng mua bán và thanh toán phần còn lại. <br/>" +
                                "Trân trọng cảm ơn!",
                                order.getId()))
                        .param(notiParam)
                        .build();

                rabbitTemplate.convertAndSend(
                        RabbitMQConfig.NOTIFICATION_EXCHANGE,
                        RabbitMQConfig.NOTIFICATION_ROUTING_KEY,
                        event);
                log.info("📧 Gửi Email Đặt cọc thành công - OrderId: {}", order.getId());
            }
        } catch (Exception e) {
            log.error("❌ Lỗi khi gửi email Đặt cọc thành công - OrderId: {} - Error: {}", order.getId(), e.getMessage());
        }
    }
}