package com.tlaq.catalog_service.service;



import com.tlaq.catalog_service.dto.request.CarModelRequest;
import com.tlaq.catalog_service.dto.response.CarModelResponse;

import java.util.List;

public interface CarModelService {
    List<CarModelResponse> getAll();
    CarModelResponse getById(Long id);
    CarModelResponse create(CarModelRequest request);
    void deleteById(Long id);
}
