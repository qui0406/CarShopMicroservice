package com.tlaq.main_service.controllers;

import com.tlaq.main_service.dto.ApiResponse;
import com.tlaq.main_service.dto.PageResponse;
import com.tlaq.main_service.dto.requests.carRequest.CarRequest;
import com.tlaq.main_service.dto.responses.carResponse.CarDetailsResponse;
import com.tlaq.main_service.dto.responses.carResponse.CarResponse;
import com.tlaq.main_service.entity.Car;
import com.tlaq.main_service.exceptions.AppException;
import com.tlaq.main_service.services.CarDetailsService;
import com.tlaq.main_service.validators.ImageConstraint;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CarController {
    CarDetailsService carDetailsService;

    @GetMapping(value = "/car/get-products")
    public ApiResponse<PageResponse<CarResponse>> getCars(
            @RequestParam(value ="page", required = false, defaultValue = "1") int page,
            @RequestParam(value = "size", required = false, defaultValue = "12") int size
    ){
        return ApiResponse.<PageResponse<CarResponse>>builder()
                .result(carDetailsService.getCar(page, size))
                .build();
    }

    @GetMapping(value ="/car/get-product-by-id/{carId}")
    public ApiResponse<CarDetailsResponse> getCarById(@PathVariable String carId){
        return ApiResponse.<CarDetailsResponse>builder()
                .result(carDetailsService.getCarDetails(carId))
                .build();
    }

    @GetMapping("/car/filter-car")
    public ApiResponse<PageResponse<CarResponse>> filterCar(@RequestParam Map<String,String> filter){
        return ApiResponse.<PageResponse<CarResponse>>builder()
                .result(carDetailsService.filterCar(filter))
                .build();
    }

    @PostMapping(value = "/api-secure/car/create-product", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<CarResponse> createCar(@ModelAttribute CarRequest carRequest,
                                              @RequestParam("images") @Valid
                                              @ImageConstraint(min = 1, max = 5, message = "Chọn từ 1 tới 5 ảnh")
                                              List<MultipartFile> images) {
        try{
             carDetailsService.createCarDetail(carRequest, images);
            return ApiResponse.<CarResponse>builder()
                    .message("Car created successfully")
                    .build();
        }
        catch(AppException e){
            return ApiResponse.<CarResponse>builder()
                    .message(e.getMessage())
                    .build();
        }
    }


    @DeleteMapping("/api-secure/car/delete-product/{carId}")
    public ApiResponse<Void> deleteCar(@PathVariable("carId") String carId){
        carDetailsService.deleteCarDetail(carId);
        return ApiResponse.<Void>builder()
                .message("Car deleted successfully")
                .build();
    }

}
