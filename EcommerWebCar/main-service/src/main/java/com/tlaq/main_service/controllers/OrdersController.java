package com.tlaq.main_service.controllers;

import com.tlaq.main_service.configs.RabbitMQConfig;
import com.tlaq.main_service.dto.ApiResponse;
import com.tlaq.main_service.dto.requests.OrdersRequest;
import com.tlaq.main_service.dto.responses.OrdersResponse;
import com.tlaq.main_service.entity.Orders;
import com.tlaq.main_service.message.OrdersProducer;
import com.tlaq.main_service.services.OrdersService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/orders")
public class OrdersController {
    OrdersService ordersService;
    OrdersProducer ordersProducer;

    @GetMapping("/orders-car/{orderId}")
    public ApiResponse<OrdersResponse> getOrder(@PathVariable String orderId) {
        return ApiResponse.<OrdersResponse>builder()
                .result(ordersService.getOrders(orderId))
                .build();
    }

    @PostMapping("/create-order")
    public ApiResponse<OrdersResponse> createOrder(@RequestBody OrdersRequest ordersRequest) {
        ordersRequest.setId(UUID.randomUUID().toString());
        OrdersResponse ordersResponse = ordersService.createOrder(ordersRequest);
        ordersProducer.sendOrders(ordersRequest);
        return ApiResponse.<OrdersResponse>builder()
                .result(ordersResponse)
                .build();
    }

}
