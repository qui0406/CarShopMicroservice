package com.tlaq.main_service.controllers;

import com.tlaq.main_service.dto.ApiResponse;
import com.tlaq.main_service.dto.PageResponse;
import com.tlaq.main_service.dto.requests.carRequest.CarRequest;
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

@RestController
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/car")
public class CarController {
    CarDetailsService carDetailsService;

    @GetMapping(value = "/get-products")
    public ApiResponse<PageResponse<CarResponse>> getCars(
            @RequestParam(value ="page", required = false, defaultValue = "1") int page,
            @RequestParam(value = "size", required = false, defaultValue = "10") int size
    ){
        return ApiResponse.<PageResponse<CarResponse>>builder()
                .result(carDetailsService.getCarDetails(page, size))
                .build();
    }

    @PostMapping(value = "/create-product", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<CarResponse> createCar(@ModelAttribute CarRequest carRequest,
                                              @RequestParam("images") @Valid
                                              @ImageConstraint(min = 1, max = 5, message = "Chọn từ 1 tới 5 ảnh")
                                              List<MultipartFile> images) {
        return ApiResponse.<CarResponse>builder()
                .result(carDetailsService.createCarDetail(carRequest, images))
                .build();
    }


    @DeleteMapping("/delete-product/{carId}")
    public ApiResponse<Void> deleteCar(@PathVariable("carId") String carId){
        carDetailsService.deleteCarDetail(carId);
        return ApiResponse.<Void>builder()
                .message("Car deleted successfully")
                .build();
    }

}
