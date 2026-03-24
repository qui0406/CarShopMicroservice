package com.tlaq.ordering_service.service;

import com.tlaq.ordering_service.dto.response.OrdersHistoryResponse;
import com.tlaq.ordering_service.entity.Orders;
import com.tlaq.ordering_service.entity.enums.OrdersStatus;

import java.util.List;

public interface OrderHistoryService {
    // Lưu lại vết thay đổi trạng thái [cite: 2026-03-10]
    void saveHistory(Orders order, OrdersStatus status, String note, String createdBy);

    // Trả về Timeline cho Frontend vẽ biểu đồ tiến trình [cite: 2026-03-10]
    List<OrdersHistoryResponse> getOrderTimeline(String orderId);

    // Hàm này sẽ được gọi từ Payment Service (qua Feign hoặc Kafka) [cite: 2026-03-09, 2026-03-10]
    void handlePaymentSuccess(String orderId);
}
