package com.tlaq.catalog_service.service;

import com.tlaq.catalog_service.dto.PageResponse;
import com.tlaq.catalog_service.dto.request.CarBatchItemRequest;
import com.tlaq.catalog_service.dto.request.CarRequest;
import com.tlaq.catalog_service.dto.response.CarBatchResponse;
import com.tlaq.catalog_service.dto.response.CarResponse;
import com.tlaq.catalog_service.dto.response.CarSummaryResponse;
import com.tlaq.catalog_service.dto.response.Model3DResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface CarService {
    PageResponse<CarSummaryResponse> getCar(int page, int size);
    CarResponse getCarDetails(String carId);
    CarResponse createCarDetail(CarRequest carRequest, List<MultipartFile> images);
    void delete(String carId);
    BigDecimal getPrice(String carId);
    PageResponse<CarResponse> filterCar(Map<String, String> filter);
    Model3DResponse upload3DModel(String carId, MultipartFile file) throws IOException;
    List<CarBatchResponse> validateBatch(List<CarBatchItemRequest> items);
}
