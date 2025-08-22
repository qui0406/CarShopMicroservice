package com.tlaq.main_service.services;

import com.tlaq.main_service.dto.requests.carRequest.CarCategoryRequest;
import com.tlaq.main_service.dto.responses.carResponse.CarCategoryResponse;

import java.util.List;

public interface CarCategoryService {
    CarCategoryResponse getCarCategoryById(Long id);
    List<CarCategoryResponse> getCarCategories();
    CarCategoryResponse create(CarCategoryRequest carCategoryRequest);
    void delete(Long id);
}
