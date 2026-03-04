package com.tlaq.catalog_service.mapper;

import com.tlaq.catalog_service.dto.request.CarRequest;
import com.tlaq.catalog_service.dto.response.CarResponse;
import com.tlaq.catalog_service.entity.Car;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface CarMapper {
    @Mapping(target = "carImages", ignore = true)
    @Mapping(target = "carModel", ignore = true)
    @Mapping(target = "carSpecification", ignore = true)
    @Mapping(target = "carService", ignore = true)
    Car toCar(CarRequest request);

    @Mapping(target = "images", expression = "java(car.getCarImages().stream().map(img -> img.getImage()).toList())")
    CarResponse toCarResponse(Car car);

    @Mapping(target = "id", ignore = true)
    void updateCar(@MappingTarget Car car, CarRequest request);
}
