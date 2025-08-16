package com.tlaq.repository.httpClient;

import com.tlaq.dto.ApiResponse;
import com.tlaq.dto.response.OrdersResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "main-service", url = "${app.services.main.url}")
public interface OrdersClient {
    @GetMapping("/orders/orders-car/{orderId}")
    ApiResponse<OrdersResponse> getOrders(@PathVariable String orderId);
}
