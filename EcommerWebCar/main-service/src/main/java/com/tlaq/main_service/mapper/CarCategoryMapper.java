package com.tlaq.main_service.mapper;

import com.tlaq.main_service.dto.requests.carRequest.CarCategoryRequest;
import com.tlaq.main_service.dto.responses.carResponse.CarCategoryResponse;
import com.tlaq.main_service.entity.CarCategory;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CarCategoryMapper {
    CarCategoryResponse toResponse(CarCategory carCategory);
    CarCategory toResponse(CarCategoryRequest carCategoryRequest);
    List<CarCategoryResponse> toResponseList(List<CarCategory> carCategories);
}
