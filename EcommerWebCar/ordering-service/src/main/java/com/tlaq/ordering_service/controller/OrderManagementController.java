package com.tlaq.ordering_service.controller;

import com.tlaq.ordering_service.dto.ApiResponse;
import com.tlaq.ordering_service.dto.PageResponse;
import com.tlaq.ordering_service.dto.response.OrdersResponse;
import com.tlaq.ordering_service.dto.response.RevenueReportResponse;
import com.tlaq.ordering_service.dto.response.BrandSalesResponse;
import com.tlaq.ordering_service.entity.enums.OrdersStatus;
import com.tlaq.ordering_service.service.OrderManagementService;
import com.tlaq.ordering_service.service.OrdersService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/staff/orders")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@PreAuthorize("hasRole('STAFF') or hasRole('ADMIN')")
public class OrderManagementController {
    OrderManagementService orderManagementService;
    OrdersService ordersService;

    @GetMapping(value="/all-orders")
    public ApiResponse<PageResponse<OrdersResponse>> getAllOrders(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status) {
        return ApiResponse.<PageResponse<OrdersResponse>>builder()
                .result(orderManagementService.getAllOrders(page, size, status))
                .build();
    }

    @PatchMapping("/cancel-order/{orderId}")
    public ApiResponse<OrdersResponse> updateStatus(
            @PathVariable String orderId,
            @RequestParam OrdersStatus status,
            @RequestParam(required = false) String note) {
        return ApiResponse.<OrdersResponse>builder()
                .result(orderManagementService.updateStatus(orderId, status, note))
                .build();
    }

    @PostMapping("/confirm-order/{id}")
    public ApiResponse<String> confirmDelivery(@PathVariable String id) {
        ordersService.confirmOrders(id);
        return ApiResponse.<String>builder()
                .result("Xác nhận đơn hàng thành công!")
                .build();
    }

    @GetMapping("/stats/status-count")
    public ApiResponse<java.util.Map<String, Long>> getStatusCount() {
        return ApiResponse.<java.util.Map<String, Long>>builder()
                .result(orderManagementService.getStatusCount())
                .build();
    }

    @GetMapping("/stats/revenue")
    public ApiResponse<List<RevenueReportResponse>> getRevenueReport(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        return ApiResponse.<List<RevenueReportResponse>>builder()
                .result(orderManagementService.getRevenueReport(year, month))
                .build();
    }

    @GetMapping("/stats/brands")
    public ApiResponse<List<BrandSalesResponse>> getBrandSalesReport(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        return ApiResponse.<List<BrandSalesResponse>>builder()
                .result(orderManagementService.getBrandSalesReport(year, month))
                .build();
    }
}