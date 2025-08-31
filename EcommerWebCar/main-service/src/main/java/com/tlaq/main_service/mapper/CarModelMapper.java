package com.tlaq.main_service.mapper;

import com.tlaq.main_service.dto.requests.carRequest.CarModelRequest;
import com.tlaq.main_service.dto.responses.carResponse.CarModelResponse;
import com.tlaq.main_service.entity.CarCategory;
import com.tlaq.main_service.entity.CarModel;
import com.tlaq.main_service.mapper.decorator.CarModelMapperDecorator;
import org.mapstruct.DecoratedWith;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
@DecoratedWith(CarModelMapperDecorator.class)
public interface CarModelMapper {
    CarModel toCarModel(CarModelRequest carModelRequest);

    List<CarModelResponse> toCarBranchResponse(List<CarModel> request);

    @Mapping(target = "category", ignore = true)
    CarModelResponse toCarModelResponse(CarModel carModel);

}
