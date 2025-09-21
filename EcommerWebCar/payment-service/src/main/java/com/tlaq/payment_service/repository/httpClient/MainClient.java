package com.tlaq.payment_service.repository.httpClient;

import com.tlaq.payment_service.configs.AuthenticationRequestInterceptor;
import com.tlaq.payment_service.dto.ApiResponse;
import com.tlaq.payment_service.dto.response.OrdersResponse;
import com.tlaq.payment_service.dto.response.UserProfileResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "main", url = "${app.services.main.url}",
        configuration = { AuthenticationRequestInterceptor.class })
public interface MainClient {
    @GetMapping("/api/profile/get-profile/{userKeyCloakId}")
    ApiResponse<UserProfileResponse> getProfile(@PathVariable String userKeyCloakId);

    @GetMapping("/api/profile/get-profile-by-id/{id}")
    ApiResponse<UserProfileResponse> getProfileById(@PathVariable String id);

    @GetMapping("/api/orders/orders-car/{orderId}")
    ApiResponse<OrdersResponse> getOrder(@PathVariable String orderId);
}
