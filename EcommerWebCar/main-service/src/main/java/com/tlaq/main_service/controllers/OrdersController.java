package com.tlaq.main_service.controllers;

import com.tlaq.main_service.configs.RabbitMQConfig;
import com.tlaq.main_service.dto.ApiResponse;
import com.tlaq.main_service.dto.PageResponse;
import com.tlaq.main_service.dto.requests.OrdersRequest;
import com.tlaq.main_service.dto.responses.OrderDetailsResponse;
import com.tlaq.main_service.dto.responses.OrderHistoryResponse;
import com.tlaq.main_service.dto.responses.OrdersResponse;
import com.tlaq.main_service.entity.Orders;
//import com.tlaq.main_service.message.OrdersProducer;
import com.tlaq.main_service.entity.Profile;
import com.tlaq.main_service.services.InventoryService;
import com.tlaq.main_service.services.OrdersService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/orders")
public class OrdersController {
    OrdersService ordersService;
    InventoryService inventoryService;

    @GetMapping("/orders-car/{orderId}")
    public ApiResponse<OrdersResponse> getOrder(@PathVariable String orderId) {
        return ApiResponse.<OrdersResponse>builder()
                .result(ordersService.getOrders(orderId))
                .build();
    }

    @PostMapping("/create-order")
    public ApiResponse<OrdersResponse> createOrder(@RequestBody OrdersRequest ordersRequest,
                                                   Principal principal) {
        String orderId= UUID.randomUUID().toString();
        ordersRequest.setId(orderId);
        String userKeyCloakId = principal.getName();

        OrdersResponse ordersResponse = ordersService.createOrder(ordersRequest, userKeyCloakId);
        return ApiResponse.<OrdersResponse>builder()
                .result(ordersResponse)
                .build();
    }

    @GetMapping("/get-history-order")
    public ApiResponse<List<OrderDetailsResponse>> getHistoryOrder(Principal principal) {
        String userKeyCloakId = principal.getName();
        return ApiResponse.<List<OrderDetailsResponse>>builder()
                .result(ordersService.getHistoryResponseByProfileId(userKeyCloakId))
                .build();
    }

    @GetMapping("/get-order-deposit")
    public ApiResponse<List<OrderHistoryResponse>> getOrderPending(Principal principal) {
        String userKeyCloakId = principal.getName();
        return ApiResponse.<List<OrderHistoryResponse>>builder()
                .result(ordersService.getOrdersResponseByProfileIdAndStatus(userKeyCloakId))
                .build();
    }

    @GetMapping("/staff/get-all-order")
    public ApiResponse<PageResponse<OrdersResponse>> getAll(@RequestParam(value ="page", required = false, defaultValue = "1") int page,
                                                            @RequestParam(value = "size", required = false, defaultValue = "12") int size){
        return ApiResponse.<PageResponse<OrdersResponse>>builder()
                .result(ordersService.getAll(page, size))
                .build();
    }
}
