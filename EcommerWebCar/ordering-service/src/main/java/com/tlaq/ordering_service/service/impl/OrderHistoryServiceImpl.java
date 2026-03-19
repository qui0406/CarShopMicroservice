package com.tlaq.ordering_service.service.impl;

import com.tlaq.ordering_service.dto.response.OrdersHistoryResponse;
import com.tlaq.ordering_service.entity.Orders;
import com.tlaq.ordering_service.entity.OrdersHistory;
import com.tlaq.ordering_service.entity.enums.OrdersStatus;
import com.tlaq.ordering_service.exceptions.AppException;
import com.tlaq.ordering_service.exceptions.ErrorCode;
import com.tlaq.ordering_service.mapper.OrdersMapper;
import com.tlaq.ordering_service.repo.OrdersHistoryRepository;
import com.tlaq.ordering_service.repo.OrdersRepository;
import com.tlaq.ordering_service.service.OrderHistoryService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderHistoryServiceImpl implements OrderHistoryService {
    OrdersHistoryRepository ordersHistoryRepository;
    OrdersMapper ordersMapper;
    OrdersRepository ordersRepository;

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
        order.setStatus(OrdersStatus.PENDING);
        ordersRepository.save(order);

        // 3. Ghi lại lịch sử (Timeline)
        // actorId ở đây có thể để là "SYSTEM" vì đây là hành động tự động từ hệ thống
        String note = "Hệ thống xác nhận thanh toán thành công. Đơn hàng chuyển sang trạng thái Xác nhận.";
        saveHistory(order, OrdersStatus.PAID, note, "SYSTEM");

        log.info("✅ Đã cập nhật trạng thái và lịch sử cho đơn hàng: {}", orderId);
    }
}