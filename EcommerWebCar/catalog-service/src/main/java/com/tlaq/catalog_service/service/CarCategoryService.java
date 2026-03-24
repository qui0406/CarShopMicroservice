package com.tlaq.catalog_service.service;

import com.tlaq.catalog_service.dto.request.CarCategoryRequest;
import com.tlaq.catalog_service.dto.response.CarCategoryResponse;

import java.util.List;

public interface CarCategoryService {
    CarCategoryResponse getCarCategoryById(Long id);
    List<CarCategoryResponse> getCarCategories();
    CarCategoryResponse create(CarCategoryRequest carCategoryRequest);
    void delete(Long id);
}
