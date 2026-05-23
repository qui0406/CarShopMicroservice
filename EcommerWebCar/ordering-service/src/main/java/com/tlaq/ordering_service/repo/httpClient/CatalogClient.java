package com.tlaq.ordering_service.repo.httpClient;

import com.tlaq.ordering_service.config.AuthenticationRequestInterceptor;
import com.tlaq.ordering_service.dto.ApiResponse;
import com.tlaq.ordering_service.dto.request.CarBatchItemRequest;
import com.tlaq.ordering_service.dto.response.CarResponse;
import com.tlaq.ordering_service.dto.response.InventoryResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.math.BigDecimal;
import java.util.List;

@FeignClient(name = "catalog-service",
        configuration = { AuthenticationRequestInterceptor.class })
public interface CatalogClient {
    @GetMapping("/catalog/api/cars/check-inventory/{carId}/{quantity}")
    ApiResponse<Boolean> checkInventory(@PathVariable String carId, @PathVariable int quantity);

    @GetMapping("/catalog/api/cars/get-price/{carId}")
    ApiResponse<BigDecimal> getCarPrice(@PathVariable String carId);

    @GetMapping("/catalog/api/car/get-car-by-id/{carId}")
    ApiResponse<CarResponse> getProductById(@PathVariable String carId);

    @org.springframework.web.bind.annotation.PostMapping("/catalog/api/car/batch-validate")
    ApiResponse<List<com.tlaq.ordering_service.dto.response.CarBatchResponse>> validateBatch(
            @org.springframework.web.bind.annotation.RequestBody List<CarBatchItemRequest> request);

    /**
     * Giữ chỗ xe đồng bộ - gọi khi tạo đơn hàng để set isDeposited = true ngay lập tức.
     */
    @org.springframework.web.bind.annotation.PostMapping("/catalog/api/inventory/reserve/{carId}")
    ApiResponse<Boolean> reserveCar(@PathVariable String carId);

    /**
     * Hủy giữ chỗ xe đồng bộ - gọi khi cần rollback reservation (lỗi tạo đơn).
     */
    @org.springframework.web.bind.annotation.PostMapping("/catalog/api/inventory/unreserve/{carId}")
    ApiResponse<Boolean> unreserveCar(@PathVariable String carId);
}
