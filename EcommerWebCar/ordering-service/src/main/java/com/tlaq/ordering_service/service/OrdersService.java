package com.tlaq.ordering_service.service;


import com.tlaq.ordering_service.dto.PageResponse;
import com.tlaq.ordering_service.dto.request.OrdersRequest;
import com.tlaq.ordering_service.dto.response.OrdersDetailsResponse;
import com.tlaq.ordering_service.dto.response.OrdersHistoryResponse;
import com.tlaq.ordering_service.dto.response.OrdersResponse;
import com.tlaq.ordering_service.entity.enums.OrdersStatus;

import java.util.List;

public interface OrdersService {
    // 1. Quản lý Đơn hàng cho Khách hàng
    OrdersResponse createOrder(OrdersRequest request, String userKeyCloakId);
    OrdersResponse getOrderById(String id);
    List<OrdersResponse> getMyOrders(String userKeyCloakId); // Thay cho getHistoryResponseByProfileId

    // 2. Quản lý cho Nhân viên Showroom (Admin)
    PageResponse<OrdersResponse> getAllOrders(int page, int size, String status); // Thêm filter status
    OrdersResponse updateStatus(String orderId, OrdersStatus newStatus, String note); // Hàm quan trọng nhất cho Staff

    // 3. Xử lý logic từ Payment Service (Webhook/Callback)
    void markSuccess(String id); // Chuyển sang PAID
    void markFail(String id);    // Chuyển sang CANCELLED

    // 4. Truy vấn Lịch sử (Timeline)
    List<OrdersHistoryResponse> getOrderTimeline(String orderId);

    void confirmDelivery(String orderId);
}
