package com.tlaq.ordering_service.controller;

import com.tlaq.ordering_service.dto.ApiResponse;
import com.tlaq.ordering_service.dto.PageResponse;
import com.tlaq.ordering_service.dto.response.MonthlyRevenueResponse;
import com.tlaq.ordering_service.dto.response.OrdersResponse;
import com.tlaq.ordering_service.entity.enums.OrdersStatus;
import com.tlaq.ordering_service.service.OrderManagementService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/staff/orders")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@PreAuthorize("hasRole('STAFF') or hasRole('ADMIN')")
public class OrderManagementController {

    OrderManagementService orderManagementService;

    @GetMapping(value="/all-orders")
    public ApiResponse<PageResponse<OrdersResponse>> getAllOrders(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status) {
        return ApiResponse.<PageResponse<OrdersResponse>>builder()
                .result(orderManagementService.getAllOrders(page, size, status))
                .build();
    }

    @PatchMapping("/update-status/{orderId}")
    public ApiResponse<OrdersResponse> updateStatus(
            @PathVariable String orderId,
            @RequestParam OrdersStatus newStatus,
            @RequestParam(required = false) String note) {
        return ApiResponse.<OrdersResponse>builder()
                .result(orderManagementService.updateStatus(orderId, newStatus, note))
                .build();
    }

    @GetMapping("/revenue")
    public ApiResponse<BigDecimal> getRevenue(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ApiResponse.<BigDecimal>builder()
                .result(orderManagementService.calculateRevenue(start, end))
                .build();
    }

    @GetMapping("/stats/status-count")
    public ApiResponse<Map<OrdersStatus, Long>> getStatusCount() {
        return ApiResponse.<Map<OrdersStatus, Long>>builder()
                .result(orderManagementService.countOrdersByStatus())
                .build();
    }

    @GetMapping("/revenue/monthly")
    public ApiResponse<List<MonthlyRevenueResponse>> getMonthlyRevenue(
            @RequestParam(defaultValue = "2026") int year) {

        return ApiResponse.<List<MonthlyRevenueResponse>>builder()
                .result(orderManagementService.getYearlyRevenue(year))
                .build();
    }
}