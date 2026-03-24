package com.tlaq.catalog_service.service;

import com.tlaq.catalog_service.dto.PageResponse;
import com.tlaq.catalog_service.dto.request.CarRequest;
import com.tlaq.catalog_service.dto.response.CarResponse;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface CarService {
    PageResponse<CarResponse> getCar(int page, int size);
    CarResponse getCarDetails(String carId);
    CarResponse createCarDetail(CarRequest carRequest, List<MultipartFile> images);
    void delete(String carId);
    BigDecimal getPrice(String carId);
    PageResponse<CarResponse> filterCar(Map<String, String> filter);
}
