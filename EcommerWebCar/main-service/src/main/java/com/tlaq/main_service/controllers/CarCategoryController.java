package com.tlaq.main_service.controllers;

import com.tlaq.main_service.dto.ApiResponse;
import com.tlaq.main_service.dto.requests.carRequest.CarCategoryRequest;
import com.tlaq.main_service.dto.responses.carResponse.CarCategoryResponse;
import com.tlaq.main_service.services.CarCategoryService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CarCategoryController {
    CarCategoryService carCategoryService;

    @GetMapping("/car-category/get-all-car-category")
    public ApiResponse<List<CarCategoryResponse>> getCarCategories() {
        return ApiResponse.<List<CarCategoryResponse>>builder()
                .result(carCategoryService.getCarCategories())
                .build();
    }

    @GetMapping("/car-category/get-car-category-by-id/{carCategoryId}")
    public ApiResponse<CarCategoryResponse> getCarCategoryById(@PathVariable Long carCategoryId) {
        return ApiResponse.<CarCategoryResponse>builder()
                .result(carCategoryService.getCarCategoryById(carCategoryId))
                .build();
    }

    @PostMapping("/api-secure/car-category/create-category")
    public ApiResponse<CarCategoryResponse> createCarCategory(@RequestBody CarCategoryRequest carCategoryRequest) {
        return ApiResponse.<CarCategoryResponse>builder()
                .result(carCategoryService.create(carCategoryRequest))
                .build();
    }

    @DeleteMapping("/api-secure/car-category/delete-caterory/{carCategoryId}")
    public ApiResponse<CarCategoryResponse> deleteCarCategory(@PathVariable Long carCategoryId) {
        carCategoryService.delete(carCategoryId);
        return ApiResponse.<CarCategoryResponse>builder()
                .message("Car Category has been deleted")
                .build();
    }
}
