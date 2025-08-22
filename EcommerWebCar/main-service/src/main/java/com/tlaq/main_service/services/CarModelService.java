package com.tlaq.main_service.services;

import com.tlaq.main_service.dto.requests.carRequest.CarBranchRequest;
import com.tlaq.main_service.dto.requests.carRequest.CarModelRequest;
import com.tlaq.main_service.dto.responses.carResponse.CarBranchResponse;
import com.tlaq.main_service.dto.responses.carResponse.CarModelResponse;

import java.util.List;

public interface CarModelService {
    List<CarModelResponse> getAll();
    CarModelResponse getById(Long id);
    CarModelResponse create(CarModelRequest request);
    void deleteById(Long id);
}
