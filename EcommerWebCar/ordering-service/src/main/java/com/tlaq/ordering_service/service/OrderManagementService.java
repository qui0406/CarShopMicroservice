package com.tlaq.ordering_service.service;

import com.tlaq.ordering_service.dto.PageResponse;
import com.tlaq.ordering_service.dto.response.OrdersResponse;
import com.tlaq.ordering_service.entity.enums.OrdersStatus;

import com.tlaq.ordering_service.dto.response.BrandSalesResponse;
import com.tlaq.ordering_service.dto.response.RevenueReportResponse;
import java.util.List;

public interface OrderManagementService {
    PageResponse<OrdersResponse> getAllOrders(int page, int size, String status); // Filter đơn
    OrdersResponse updateStatus(String orderId, OrdersStatus newStatus, String note); // Duyệt đơn
    List<RevenueReportResponse> getRevenueReport(Integer year, Integer month);
    List<BrandSalesResponse> getBrandSalesReport(Integer year, Integer month);
    java.util.Map<String, Long> getStatusCount();
}
