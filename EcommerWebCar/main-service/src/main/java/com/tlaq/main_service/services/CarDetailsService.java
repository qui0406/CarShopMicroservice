package com.tlaq.main_service.services;

import com.tlaq.main_service.dto.PageResponse;
import com.tlaq.main_service.dto.requests.carRequest.CarRequest;
import com.tlaq.main_service.dto.responses.carResponse.CarResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface CarDetailsService {
    PageResponse<CarResponse> getCarDetails(int page, int size);
    CarResponse createCarDetail(CarRequest carRequest, List<MultipartFile> images);
    void deleteCarDetail(String carId);
}
