package com.tlaq.catalog_service.service;

import com.tlaq.catalog_service.dto.request.CarSpecificationRequest;
import com.tlaq.catalog_service.dto.response.CarSpecificationResponse;

import java.util.List;

public interface CarSpecificationService {
    CarSpecificationResponse create(CarSpecificationRequest carSpecificationRequest);
    List<CarSpecificationResponse> findAll();
    CarSpecificationResponse getByCarId(Long carId);
    CarSpecificationResponse update(Long carId, CarSpecificationRequest carSpecificationRequest);
    void delete(Long carId);
}
