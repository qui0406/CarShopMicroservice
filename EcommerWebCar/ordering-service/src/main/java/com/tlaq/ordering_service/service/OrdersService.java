package com.tlaq.ordering_service.service;


import com.tlaq.ordering_service.dto.PageResponse;
import com.tlaq.ordering_service.dto.request.OrdersRequest;
import com.tlaq.ordering_service.dto.response.OrdersDetailsResponse;
import com.tlaq.ordering_service.dto.response.OrdersHistoryResponse;
import com.tlaq.ordering_service.dto.response.OrdersResponse;
import com.tlaq.ordering_service.entity.enums.OrdersStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public interface OrdersService {
    OrdersResponse createOrder(OrdersRequest request); // Tạo đơn & tính thuế lăn bánh
    OrdersResponse getOrderById(String id);           // Xem chi tiết đơn
    List<OrdersResponse> getMyOrders(String userId);  // Danh sách đơn của tôi
    void cancelOrder(String orderId, String reason);  // Khách tự hủy khi chưa duyệt
    void confirmDelivery(String orderId);             // Khách xác nhận đã nhận xe
}
