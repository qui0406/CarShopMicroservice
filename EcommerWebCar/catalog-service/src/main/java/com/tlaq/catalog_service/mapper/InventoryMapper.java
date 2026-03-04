package com.tlaq.catalog_service.mapper;

import com.tlaq.catalog_service.dto.request.InventoryRequest;
import com.tlaq.catalog_service.dto.response.InventoryResponse;
import com.tlaq.catalog_service.entity.Inventory;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface InventoryMapper {
    @Mapping(target = "car", ignore = true)
    @Mapping(target = "showRoom", ignore = true)
    Inventory toInventory(InventoryRequest request);

    InventoryResponse toInventoryResponse(Inventory inventory);
}