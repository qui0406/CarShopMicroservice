package com.tlaq.payment_service.repository.httpClient;

import com.tlaq.payment_service.dto.ApiResponse;
import com.tlaq.payment_service.dto.response.CarResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "catalog-service")
public interface CatalogClient {
    @GetMapping("/catalog/api/car/get-car-by-id/{carId}")
    ApiResponse<CarResponse> getProductById(@PathVariable("carId") String carId);
}
