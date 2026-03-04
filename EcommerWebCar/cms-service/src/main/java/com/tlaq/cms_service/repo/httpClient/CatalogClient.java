package com.tlaq.cms_service.repo.httpClient;

import com.tlaq.cms_service.config.AuthenticationRequestInterceptor;
import com.tlaq.cms_service.dto.ApiResponse;
import com.tlaq.cms_service.dto.response.ShowRoomResponse;
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

    @GetMapping("/api/showroom/get-showroom/{showroomId}")
    ApiResponse<ShowRoomResponse> getShowRoomById(@PathVariable("showroomId") String showroomId);
}
