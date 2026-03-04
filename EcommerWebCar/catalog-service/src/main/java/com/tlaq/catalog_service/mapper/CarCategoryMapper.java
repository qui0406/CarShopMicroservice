package com.tlaq.catalog_service.mapper;

import com.tlaq.catalog_service.dto.request.CarCategoryRequest;
import com.tlaq.catalog_service.dto.response.CarCategoryResponse;
import com.tlaq.catalog_service.entity.CarCategory;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CarCategoryMapper {
    CarCategoryResponse toResponse(CarCategory carCategory);
    CarCategory toResponse(CarCategoryRequest carCategoryRequest);
    List<CarCategoryResponse> toResponseList(List<CarCategory> carCategories);
}
