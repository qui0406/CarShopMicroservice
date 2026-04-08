package com.tlaq.catalog_service.mapper;

import com.tlaq.catalog_service.dto.request.TechSpecRequest;
import com.tlaq.catalog_service.dto.response.TechSpecResponse;
import com.tlaq.catalog_service.entity.Inventory;
import com.tlaq.catalog_service.entity.TechnicalSpec;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TechSpecMapper {
    TechSpecResponse toResponse(TechnicalSpec entity);

    @Mapping(source = "fuelType", target = "fuelType") // Map từ String sang Enum FuelType
    @Mapping(source = "bodyType", target = "bodyType")
    TechnicalSpec toEntity(TechSpecRequest request);
}