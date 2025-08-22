package com.tlaq.main_service.services;

import com.tlaq.main_service.dto.PageResponse;
import com.tlaq.main_service.dto.requests.carRequest.CarRequest;
import com.tlaq.main_service.dto.responses.carResponse.CarDetailsResponse;
import com.tlaq.main_service.dto.responses.carResponse.CarResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface CarDetailsService {
    PageResponse<CarResponse> getCar(int page, int size);
    CarDetailsResponse getCarDetails(String carId);
    void createCarDetail(CarRequest carRequest, List<MultipartFile> images);
    void deleteCarDetail(String carId);
}
