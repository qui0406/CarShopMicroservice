package com.tlaq.ordering_service.repo.httpClient;

import com.tlaq.ordering_service.config.AuthenticationRequestInterceptor;
import com.tlaq.ordering_service.dto.ApiResponse;
import com.tlaq.ordering_service.dto.response.CarResponse;
import com.tlaq.ordering_service.dto.response.InventoryResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.math.BigDecimal;

@FeignClient(name = "catalog-service", url = "${app.services.catalog.url}",
        configuration = { AuthenticationRequestInterceptor.class })
public interface CatalogClient {
    @GetMapping("/catalog/api/cars/check-inventory/{carId}/{quantity}")
    ApiResponse<Boolean> checkInventory(@PathVariable String carId, @PathVariable int quantity);

    @GetMapping("/catalog/api/cars/get-price/{carId}")
    ApiResponse<BigDecimal> getCarPrice(@PathVariable String carId);

    @GetMapping("/catalog/api/car/get-product-by-id/{carId}")
    ApiResponse<CarResponse> getProductById(@PathVariable String carId);
}
