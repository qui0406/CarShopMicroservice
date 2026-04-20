package com.tlaq.catalog_service.mapper;

import com.tlaq.catalog_service.dto.request.InventoryRequest;
import com.tlaq.catalog_service.dto.response.InventoryResponse;
import com.tlaq.catalog_service.entity.Car; // Nhớ import Car nhé
import com.tlaq.catalog_service.entity.Inventory;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface InventoryMapper {

    @Mapping(target = "showRoom", ignore = true)
    Inventory toInventory(InventoryRequest request);

    @Mapping(target = "id", source = "inventory.id")
    @Mapping(target = "quantity", source = "inventory.quantity")
    @Mapping(target = "lastUpdated", source = "inventory.updatedAt")
    @Mapping(target = "carId", source = "car.id")
    @Mapping(target = "carName", source = "car.carModel.name")
    @Mapping(target = "carThumbnail", source = "car.carModel.thumbnailImage")
    @Mapping(target = "carSku", source = "car.vinNumber")
    @Mapping(target = "carPrice", source = "car.price")
    @Mapping(target = "color", source = "car.color")
    @Mapping(target = "fuelType", source = "car.carModel.technicalSpec.fuelType")
    @Mapping(target = "transmission", source = "car.carModel.technicalSpec.transmission")
    InventoryResponse toInventoryResponse(Inventory inventory, Car car);
}