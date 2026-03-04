package com.tlaq.ordering_service.controller;

import com.tlaq.ordering_service.dto.ApiResponse;
import com.tlaq.ordering_service.dto.PageResponse;
import com.tlaq.ordering_service.dto.response.OrdersResponse;
import com.tlaq.ordering_service.service.OrdersService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/staff/orders")
@PreAuthorize("hasRole('STAFF')") // Chỉ nhân viên mới được truy cập [cite: 2026-03-03]
@RequiredArgsConstructor
public class StaffOrderController {
    OrdersService orderService;

    // 1. Lấy danh sách đơn hàng cần xử lý (Lọc theo trạng thái PENDING, PAID...) [cite: 2026-03-03]
    @GetMapping("/all")
    public ApiResponse<PageResponse<OrdersResponse>> getAllOrders(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.<PageResponse<OrdersResponse>>builder()
                .result(orderService.getAllOrders(page, size))
                .build();
    }

    // 2. Xác nhận đã giao xe cho khách (Kết thúc vòng đời đơn hàng) [cite: 2026-03-03]
    @PostMapping("/{id}/confirm-delivery")
    public ApiResponse<String> confirmDelivery(@PathVariable String id) {
        orderService.confirmDelivery(id);
        return ApiResponse.<String>builder().result("Xác nhận giao xe thành công!").build();
    }
}