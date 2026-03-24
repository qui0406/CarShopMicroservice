package com.tlaq.ordering_service.repo.httpClient;

import com.tlaq.ordering_service.config.AuthenticationRequestInterceptor;
import com.tlaq.ordering_service.dto.ApiResponse;
import com.tlaq.ordering_service.dto.MonthlyRevenueProjection;
import com.tlaq.ordering_service.dto.response.OrderPaymentResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "payment-service", url = "${app.services.pay.url}",
        configuration = { AuthenticationRequestInterceptor.class })
public interface PaymentClient {
    @GetMapping("/api/payments/order/{orderId}")
    ApiResponse<OrderPaymentResponse> getPaymentByOrderId(@PathVariable String orderId);

    @GetMapping("/api/payments/my-payments")
    ApiResponse<List<OrderPaymentResponse>> getMyPayments();
}
