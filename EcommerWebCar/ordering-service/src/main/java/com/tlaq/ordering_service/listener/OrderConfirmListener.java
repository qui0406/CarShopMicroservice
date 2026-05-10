package com.tlaq.ordering_service.listener;

import com.tlaq.ordering_service.config.RabbitMQConfig;
import com.tlaq.ordering_service.entity.Orders;
import com.tlaq.ordering_service.entity.enums.OrdersStatus;
import com.tlaq.ordering_service.repo.OrdersRepository;
import com.tlaq.ordering_service.service.OrderHistoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderConfirmListener {

    private final OrdersRepository ordersRepository;
    private final OrderHistoryService orderHistoryService; // Thêm service để ghi lịch sử

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

        // Xử lý Idempotency: Bỏ qua nếu đơn đã đặt cọc, đã thanh toán hoặc đã bị hủy
        if (order.getStatus() == OrdersStatus.DEPOSITED || order.getStatus() == OrdersStatus.PAID || order.getStatus() == OrdersStatus.CANCELLED) {
            log.info("Đơn hàng {} hiện đang ở trạng thái {}. Bỏ qua xử lý.", orderId, order.getStatus());
            return;
        }

        // Cập nhật trạng thái
        order.setStatus(OrdersStatus.DEPOSITED);
        ordersRepository.save(order);

        // Ghi lại lịch sử (Rất quan trọng khi làm khóa luận)
        orderHistoryService.saveHistory(
                order,
                OrdersStatus.DEPOSITED,
                "Hệ thống (RabbitMQ) tự động xác nhận khách đã đặt cọc thành công",
                "SYSTEM"
        );

        log.info("Đã cập nhật đơn hàng {} sang DEPOSITED", orderId);
    }
}