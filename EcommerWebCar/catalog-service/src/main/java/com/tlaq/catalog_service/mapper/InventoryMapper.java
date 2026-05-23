package com.tlaq.catalog_service.mapper;

import com.tlaq.catalog_service.dto.response.InventoryResponse;
import com.tlaq.catalog_service.entity.Car;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface InventoryMapper {

    @Mapping(target = "id", source = "car.id")
    @Mapping(target = "quantity", expression = "java(car.isReady() ? 1 : 0)")
    @Mapping(target = "lastUpdated", source = "car.updatedAt")
    @Mapping(target = "carId", source = "car.id")
    @Mapping(target = "carName", source = "car.carModel.name")
    @Mapping(target = "carSku", source = "car.vinNumber")
    @Mapping(target = "carPrice", source = "car.price")
    @Mapping(target = "color", source = "car.color")
    @Mapping(target = "fuelType", source = "car.technicalSpec.fuelType")
    @Mapping(target = "transmission", source = "car.technicalSpec.transmission")
    InventoryResponse toInventoryResponse(Car car);
}