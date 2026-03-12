package com.tlaq.catalog_service.controller;

import com.tlaq.catalog_service.dto.ApiResponse;
import com.tlaq.catalog_service.dto.PageResponse;
import com.tlaq.catalog_service.dto.request.CarRequest;
import com.tlaq.catalog_service.dto.response.CarResponse;
import com.tlaq.catalog_service.exceptions.AppException;
import com.tlaq.catalog_service.service.CarService;
import com.tlaq.catalog_service.validators.ImageConstraint;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CarController {
    CarService carDetailsService;

    @GetMapping(value = "/car/get-products")
    public ApiResponse<PageResponse<CarResponse>> getCars(
            @RequestParam(value ="page", required = false, defaultValue = "1") int page,
            @RequestParam(value = "size", required = false, defaultValue = "12") int size
    ){
        return ApiResponse.<PageResponse<CarResponse>>builder()
                .result(carDetailsService.getCar(page, size))
                .build();
    }


    @GetMapping("/get-price/{carId}")
    public ApiResponse<BigDecimal> getCarPrice(@PathVariable String carId) {
        return ApiResponse.<BigDecimal>builder()
                .result(carDetailsService.getPrice(carId))
                .build();
    }


    @GetMapping(value ="/car/get-product-by-id/{carId}")
    public ApiResponse<CarResponse> getCarById(@PathVariable String carId){
        return ApiResponse.<CarResponse>builder()
                .result(carDetailsService.getCarDetails(carId))
                .build();
    }

    @GetMapping("/car/filter-car")
    public ApiResponse<PageResponse<CarResponse>> filterCar(@RequestParam Map<String,String> filter){
        return ApiResponse.<PageResponse<CarResponse>>builder()
                .result(carDetailsService.filterCar(filter))
                .build();
    }

    @PreAuthorize("hasRole('STAFF')")
    @PostMapping(value = "/staff/car/create-product", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<CarResponse> createCar(
            @RequestPart("request") @Valid CarRequest request,
            @RequestPart("images") List<MultipartFile> images
    ) {
        return ApiResponse.<CarResponse>builder()
                .result(carDetailsService.createCarDetail(request, images))
                .build();
    }

    @PreAuthorize("hasRole('STAFF')")
    @DeleteMapping("/staff/car/delete-product/{carId}")
    public ApiResponse<Void> deleteCar(@PathVariable("carId") String carId){
        carDetailsService.delete(carId);
        return ApiResponse.<Void>builder()
                .message("Car deleted successfully")
                .build();
    }

}
