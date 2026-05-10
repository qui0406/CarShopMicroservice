package com.tlaq.ordering_service.service;

import com.tlaq.ordering_service.dto.PageResponse;
import com.tlaq.ordering_service.dto.response.MonthlyRevenueResponse;
import com.tlaq.ordering_service.dto.response.OrdersResponse;
import com.tlaq.ordering_service.entity.enums.OrdersStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public interface OrderManagementService {
    PageResponse<OrdersResponse> getAllOrders(int page, int size, String status); // Filter đơn
    OrdersResponse updateStatus(String orderId, OrdersStatus newStatus, String note); // Duyệt đơn

    BigDecimal calculateRevenue(LocalDateTime start, LocalDateTime end);
    Map<OrdersStatus, Long> countOrdersByStatus();

    List<MonthlyRevenueResponse> getYearlyRevenue(int year);
}
