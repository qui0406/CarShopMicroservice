package com.tlaq.catalog_service.mapper;

import com.tlaq.catalog_service.dto.request.TechSpecRequest;
import com.tlaq.catalog_service.dto.response.TechSpecResponse;
import com.tlaq.catalog_service.entity.Inventory;
import com.tlaq.catalog_service.entity.TechnicalSpec;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface TechSpecMapper {
    TechSpecResponse toResponse(TechnicalSpec request);
    TechnicalSpec toTechSpec(TechSpecRequest request);
}
