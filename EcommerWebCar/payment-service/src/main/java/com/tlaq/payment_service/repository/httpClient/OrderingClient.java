package com.tlaq.payment_service.repository.httpClient;

import com.tlaq.payment_service.configs.AuthenticationRequestInterceptor;
import com.tlaq.payment_service.dto.ApiResponse;
import com.tlaq.payment_service.dto.response.OrdersResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "ordering-service", url = "${app.services.main.url}",
        configuration = { AuthenticationRequestInterceptor.class })
public interface OrderingClient {
    @GetMapping("/api/orders/orders-car/{orderId}")
    ApiResponse<OrdersResponse> getOrder(@PathVariable String orderId);
}
