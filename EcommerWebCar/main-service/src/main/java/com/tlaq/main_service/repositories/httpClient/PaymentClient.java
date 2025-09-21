package com.tlaq.main_service.repositories.httpClient;

import com.tlaq.main_service.configs.AuthenticationRequestInterceptor;
import com.tlaq.main_service.dto.ApiResponse;
import com.tlaq.main_service.dto.responses.MonthlyRevenueProjection;
import com.tlaq.main_service.dto.responses.OrderPaymentResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "payment-service", url = "${app.services.pay.url}",
        configuration = { AuthenticationRequestInterceptor.class })
public interface PaymentClient {

    @GetMapping("/api/get-my-payment")
    ApiResponse<List<OrderPaymentResponse>> orderPayment();

    @GetMapping("/api/stats/monthly")
    ApiResponse<List<MonthlyRevenueProjection>> getMonthlyRevenue();

    @GetMapping("/api/stats/monthly/{year}/{month}")
    ApiResponse<MonthlyRevenueProjection> getRevenueByMonth(@PathVariable int year,
                                                            @PathVariable int month);
}
