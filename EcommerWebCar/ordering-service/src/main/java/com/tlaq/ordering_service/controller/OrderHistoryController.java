package com.tlaq.ordering_service.controller;

import com.tlaq.ordering_service.dto.ApiResponse;
import com.tlaq.ordering_service.dto.response.OrdersHistoryResponse;
import com.tlaq.ordering_service.service.OrderHistoryService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders/history")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderHistoryController {
    OrderHistoryService orderHistoryService;

    @GetMapping("/{orderId}/timeline")
    public ApiResponse<List<OrdersHistoryResponse>> getOrderTimeline(@PathVariable String orderId) {
        return ApiResponse.<List<OrdersHistoryResponse>>builder()
                .result(orderHistoryService.getOrderTimeline(orderId))
                .build();
    }
}