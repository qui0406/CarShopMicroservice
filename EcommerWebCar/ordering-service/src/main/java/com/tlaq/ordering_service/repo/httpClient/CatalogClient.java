package com.tlaq.ordering_service.repo.httpClient;

import com.tlaq.ordering_service.config.AuthenticationRequestInterceptor;
import com.tlaq.ordering_service.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.math.BigDecimal;

@FeignClient(name = "catalog-service", url = "${app.services.main.url}",
        configuration = { AuthenticationRequestInterceptor.class })
public interface CatalogClient {
    @GetMapping("/api/cars/check-inventory/{carId}/{quantity}")
    ApiResponse<Boolean> checkInventory(@PathVariable String carId, @PathVariable int quantity);

    @GetMapping("/api/cars/get-price/{carId}")
    ApiResponse<BigDecimal> getCarPrice(@PathVariable String carId);
}
