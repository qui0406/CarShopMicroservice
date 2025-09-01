package com.tlaq.main_service.repositories.httpClient;

import com.tlaq.main_service.configs.AuthenticationRequestInterceptor;
import org.springframework.cloud.openfeign.FeignClient;

@FeignClient(name = "payment-service", url = "${app.services.main.url}",
        configuration = { AuthenticationRequestInterceptor.class })
public interface PaymentClient {

}
