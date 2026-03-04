package com.tlaq.catalog_service.mapper;

import com.tlaq.catalog_service.dto.request.CarModelRequest;
import com.tlaq.catalog_service.dto.response.CarModelResponse;
import com.tlaq.catalog_service.entity.CarModel;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CarModelMapper {
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "carBranch", ignore = true)
    CarModel toCarModel(CarModelRequest request);

    @Mapping(target = "category", ignore = true)
    @Mapping(target = "carBranch", ignore = true)
    List<CarModelResponse> toListCarModel(List<CarModel> carModels);

    CarModelResponse toCarModelResponse(CarModel carModel);
}