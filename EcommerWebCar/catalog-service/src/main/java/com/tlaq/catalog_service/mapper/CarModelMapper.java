package com.tlaq.catalog_service.mapper;

import com.tlaq.catalog_service.dto.request.CarModelRequest;
import com.tlaq.catalog_service.dto.response.CarModelResponse;
import com.tlaq.catalog_service.entity.CarModel;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring",
        uses = {TechSpecMapper.class,
                EquipmentMapper.class,
                CarBranchMapper.class,
                CarCategoryMapper.class})
public interface CarModelMapper {

    CarModelResponse toCarModelResponse(CarModel carModel);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "cars", ignore = true)
    @Mapping(source = "thumbnailImage", target = "thumbnailImage")
    CarModel toCarModel(CarModelRequest request);

    List<CarModelResponse> toListCarModel(List<CarModel> carModels);
}