package com.tlaq.main_service.repositories.httpClient;

import com.tlaq.main_service.configs.AuthenticationRequestInterceptor;
import com.tlaq.main_service.dto.ApiResponse;
import com.tlaq.main_service.dto.responses.OrderPaymentResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@FeignClient(name = "payment-service", url = "${app.services.pay.url}",
        configuration = { AuthenticationRequestInterceptor.class })
public interface PaymentClient {

    @GetMapping("/get-my-payment")
    ApiResponse<List<OrderPaymentResponse>> orderPayment();
}
