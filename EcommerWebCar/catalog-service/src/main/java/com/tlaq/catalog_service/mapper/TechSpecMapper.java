package com.tlaq.catalog_service.mapper;

import com.tlaq.catalog_service.dto.request.TechSpecRequest;
import com.tlaq.catalog_service.dto.response.TechSpecResponse;
import com.tlaq.catalog_service.entity.TechnicalSpec;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface TechSpecMapper {
    TechSpecResponse toResponse(TechnicalSpec entity);

    @Mapping(source = "fuelType", target = "fuelType") // Map từ String sang Enum FuelType
    TechnicalSpec toEntity(TechSpecRequest request);

    @Mapping(source = "fuelType", target = "fuelType")
    void updateEntity(@MappingTarget TechnicalSpec entity, TechSpecRequest request);
}