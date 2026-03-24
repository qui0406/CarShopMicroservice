package com.tlaq.catalog_service.mapper;

import com.tlaq.catalog_service.dto.request.EquipmentRequest;
import com.tlaq.catalog_service.dto.response.EquipmentResponse;
import com.tlaq.catalog_service.entity.Equipment;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface EquipmentMapper {
    Equipment toEntity(EquipmentRequest request);

    EquipmentResponse toResponse(Equipment entity);

    void updateEntity(@MappingTarget Equipment entity, EquipmentRequest request);
}