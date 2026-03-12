package com.tlaq.ordering_service.controller;

import com.tlaq.ordering_service.dto.ApiResponse;
import com.tlaq.ordering_service.dto.request.OrdersRequest;
import com.tlaq.ordering_service.dto.response.OrdersResponse;
import com.tlaq.ordering_service.service.OrderExportService;
import com.tlaq.ordering_service.service.OrdersService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderController {
    OrdersService ordersService;

    @PostMapping("/create")
    public ApiResponse<OrdersResponse> createOrder(@RequestBody OrdersRequest request) {
        return ApiResponse.<OrdersResponse>builder()
                .result(ordersService.createOrder(request))
                .build();
    }

    @GetMapping("/my-orders")
    public ApiResponse<List<OrdersResponse>> getMyOrders() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userId = auth.getName();

        return ApiResponse.<List<OrdersResponse>>builder()
                .result(ordersService.getMyOrders(userId))
                .build();
    }

    @PreAuthorize("hasRole('STAFF')")
    @GetMapping("/staff/get-order-by-id/{id}")
    public ApiResponse<OrdersResponse> getOrderById(@PathVariable String id) {
        return ApiResponse.<OrdersResponse>builder()
                .result(ordersService.getOrderById(id))
                .build();
    }

    @PostMapping("/cancel-order-id/{id}")
    public ApiResponse<String> cancelOrder(
            @PathVariable String id,
            @RequestParam String reason) {
        ordersService.cancelOrder(id, reason);
        return ApiResponse.<String>builder()
                .result("Hủy đơn hàng thành công.")
                .build();
    }

    @PreAuthorize("hasRole('STAFF')")
    @PostMapping("/confirm-delivery/{id}")
    public ApiResponse<String> confirmDelivery(@PathVariable String id) {
        ordersService.confirmDelivery(id);
        return ApiResponse.<String>builder()
                .result("Xác nhận đã nhận xe thành công. Chúc mừng quý khách!")
                .build();
    }
}
