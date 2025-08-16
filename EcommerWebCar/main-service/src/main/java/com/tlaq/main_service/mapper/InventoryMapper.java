package com.tlaq.main_service.mapper;

import com.tlaq.main_service.dto.requests.inventoryRequest.InventoryRequest;
import com.tlaq.main_service.dto.responses.InventoryResponse;
import com.tlaq.main_service.entity.Inventory;
import com.tlaq.main_service.mapper.decorator.InventoryMapperDecorator;
import org.mapstruct.DecoratedWith;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
@DecoratedWith(InventoryMapperDecorator.class)
public interface InventoryMapper {
    Inventory toInventory(InventoryRequest inventoryRequest);
    InventoryResponse toInventoryResponse(Inventory inventory);
}
