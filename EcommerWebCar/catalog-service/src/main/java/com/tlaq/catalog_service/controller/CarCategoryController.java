package com.tlaq.catalog_service.controller;

import com.tlaq.catalog_service.dto.ApiResponse;
import com.tlaq.catalog_service.dto.request.CarCategoryRequest;
import com.tlaq.catalog_service.dto.response.CarCategoryResponse;
import com.tlaq.catalog_service.service.CarCategoryService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api")
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

    @PreAuthorize("hasRole('STAFF')")
    @PostMapping("/staff/car-category/create-category")
    public ApiResponse<CarCategoryResponse> createCarCategory(@RequestBody CarCategoryRequest carCategoryRequest) {
        return ApiResponse.<CarCategoryResponse>builder()
                .result(carCategoryService.create(carCategoryRequest))
                .build();
    }

    @DeleteMapping("/staff/car-category/delete-category/{carCategoryId}")
    public ApiResponse<CarCategoryResponse> deleteCarCategory(@PathVariable Long carCategoryId) {
        carCategoryService.delete(carCategoryId);
        return ApiResponse.<CarCategoryResponse>builder()
                .message("Car Category has been deleted")
                .build();
    }
}
