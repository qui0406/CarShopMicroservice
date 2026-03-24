package com.tlaq.catalog_service.mapper;

import com.tlaq.catalog_service.dto.response.AppraisalImageResponse;
import com.tlaq.catalog_service.entity.AppraisalImage;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AppraisalImageMapper {
    AppraisalImageResponse toResponse(AppraisalImage entity);
}