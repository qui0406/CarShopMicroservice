package com.tlaq.catalog_service.controller;

import com.tlaq.catalog_service.dto.ApiResponse;
import com.tlaq.catalog_service.dto.PageResponse;
import com.tlaq.catalog_service.dto.request.CarBatchItemRequest;
import com.tlaq.catalog_service.dto.request.CarRequest;
import com.tlaq.catalog_service.dto.response.CarBatchResponse;
import com.tlaq.catalog_service.dto.response.CarResponse;
import com.tlaq.catalog_service.dto.response.CarSummaryResponse;
import com.tlaq.catalog_service.dto.response.Model3DResponse;
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

import java.io.IOException;
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

    @GetMapping(value = "/car/get-cars")
    public ApiResponse<PageResponse<CarSummaryResponse>> getCars(
            @RequestParam(value ="page", required = false, defaultValue = "1") int page,
            @RequestParam(value = "size", required = false, defaultValue = "12") int size,
            @RequestParam(value = "isReady", required = false, defaultValue = "true") boolean isReady,
            @RequestParam(value = "isUsed", required = false, defaultValue = "false") boolean isUsed
    ){
        return ApiResponse.<PageResponse<CarSummaryResponse>>builder()
                .result(carDetailsService.getCars(isReady, isUsed, page, size))
                .build();
    }



    @GetMapping("/get-price/{carId}")
    public ApiResponse<BigDecimal> getCarPrice(@PathVariable String carId) {
        return ApiResponse.<BigDecimal>builder()
                .result(carDetailsService.getPrice(carId))
                .build();
    }

    @GetMapping(value ="/car/get-car-by-id/{carId}")
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
    @GetMapping(value = "/staff/car/get-cars")
    public ApiResponse<PageResponse<CarSummaryResponse>> getStaffCars(
            @RequestParam(value ="page", required = false, defaultValue = "1") int page,
            @RequestParam(value = "size", required = false, defaultValue = "12") int size
    ){
        return ApiResponse.<PageResponse<CarSummaryResponse>>builder()
                .result(carDetailsService.getStaffCars(page, size))
                .build();
    }

    @PreAuthorize("hasRole('STAFF')")
    @PostMapping(value = "/staff/car/create-car", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<CarResponse> createCar(
            @RequestPart("request") @Valid CarRequest request,
            @RequestPart("images") List<MultipartFile> images
    ) {
        return ApiResponse.<CarResponse>builder()
                .result(carDetailsService.createCarDetail(request, images))
                .build();
    }

    @PreAuthorize("hasRole('STAFF')")
    @PutMapping(value = "/staff/car/update-car/{carId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<CarResponse> updateCar(
            @PathVariable String carId,
            @RequestPart("request") @Valid CarRequest request,
            @RequestPart(value = "images", required = false) List<MultipartFile> images
    ) {
        return ApiResponse.<CarResponse>builder()
                .result(carDetailsService.updateCarDetail(carId, request, images))
                .build();
    }

    @PreAuthorize("hasRole('STAFF')")
    @PostMapping(value = "/staff/car/upload-3d-model/{carId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<Model3DResponse> upload3DModel( @PathVariable String carId,
                                                       @RequestPart("file") MultipartFile file) throws IOException {
        return ApiResponse.<Model3DResponse>builder()
                .result(carDetailsService.upload3DModel(carId, file))
                .build();
    }


    @PreAuthorize("hasRole('STAFF')")
    @DeleteMapping("/staff/car/delete-car/{carId}")
    public ApiResponse<Void> deleteCar(@PathVariable("carId") String carId){
        carDetailsService.delete(carId);
        return ApiResponse.<Void>builder()
                .message("Car deleted successfully")
                .build();
    }

    @PostMapping("/car/batch-validate")
    public ApiResponse<List<CarBatchResponse>> validateBatch(
            @RequestBody List<CarBatchItemRequest> request
    ) {
        return ApiResponse.<List<CarBatchResponse>>builder()
                .result(carDetailsService.validateBatch(request))
                .build();
    }

    @PutMapping("/car/mark-deposited/{carId}")
    public ApiResponse<Void> markCarDeposited(@PathVariable String carId) {
        carDetailsService.markCarDeposited(carId);
        return ApiResponse.<Void>builder()
                .message("Đã cập nhật trạng thái đặt cọc xe thành công")
                .build();
    }

    @PutMapping("/car/unmark-deposited/{carId}")
    public ApiResponse<Void> unmarkCarDeposited(@PathVariable String carId) {
        carDetailsService.unmarkCarDeposited(carId);
        return ApiResponse.<Void>builder()
                .message("Đã hủy trạng thái đặt cọc xe thành công")
                .build();
    }
}
