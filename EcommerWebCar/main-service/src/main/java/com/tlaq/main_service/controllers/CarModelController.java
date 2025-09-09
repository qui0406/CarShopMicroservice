package com.tlaq.main_service.controllers;

import com.tlaq.main_service.dto.ApiResponse;
import com.tlaq.main_service.dto.requests.carRequest.CarModelRequest;
import com.tlaq.main_service.dto.responses.carResponse.CarModelResponse;
import com.tlaq.main_service.services.CarModelService;
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
public class CarModelController {
    CarModelService carModelService;

    @GetMapping("/car-model/get-all-car-model")
    public ApiResponse<List<CarModelResponse>> getAllCarModel(){
        return ApiResponse.<List<CarModelResponse>>builder()
                .result(carModelService.getAll())
                .build();
    }

    @GetMapping("/car-model/get-car-model-by-id/{carModelId}")
    public ApiResponse<CarModelResponse> getCarModelById(@PathVariable("carModelId") Long carModelId){
        return ApiResponse.<CarModelResponse>builder()
                .result(carModelService.getById(carModelId))
                .build();
    }

    @PostMapping("/staff/car-model/create-car-model")
    public ApiResponse<CarModelResponse> createCarModel(@RequestBody CarModelRequest carModelRequest){
        return ApiResponse.<CarModelResponse>builder()
                .result(carModelService.create(carModelRequest))
                .build();
    }

    @DeleteMapping("/staff/car-model/delete-car-model/{carModelId}")
    public ApiResponse<CarModelResponse> deleteCarModel(@PathVariable("carModelId") Long carModelId){
        carModelService.deleteById(carModelId);
        return ApiResponse.<CarModelResponse>builder()
                .message("Car Model has been deleted")
                .build();
    }
}
