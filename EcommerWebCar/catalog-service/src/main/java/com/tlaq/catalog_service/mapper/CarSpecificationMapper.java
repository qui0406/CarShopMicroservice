package com.tlaq.catalog_service.mapper;

import com.tlaq.catalog_service.dto.request.CarSpecificationRequest;
import com.tlaq.catalog_service.dto.response.CarSpecificationResponse;
import com.tlaq.catalog_service.entity.CarSpecification;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface CarSpecificationMapper {
    CarSpecification toEntity(CarSpecificationRequest request);

    CarSpecificationResponse toResponse(CarSpecification entity);

    void updateEntity(@MappingTarget CarSpecification entity, CarSpecificationRequest request);
}