package com.tlaq.catalog_service.mapper;

import com.tlaq.catalog_service.dto.request.AppraisalRequestDto;
import com.tlaq.catalog_service.dto.response.AppraisalResponse;
import com.tlaq.catalog_service.entity.AppraisalRequest;
import com.tlaq.catalog_service.entity.CarBranch;
import com.tlaq.catalog_service.entity.CarModel;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface AppraisalMapper {

    // Map từ DTO sang Entity để lưu Database [cite: 2026-02-25]
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "branch", ignore = true)
    @Mapping(target = "model", ignore = true)
    @Mapping(target = "images", ignore = true) // Xử lý riêng khi upload Cloudinary [cite: 2026-02-25]
    @Mapping(target = "status", constant = "PENDING")
    AppraisalRequest toEntity(AppraisalRequestDto dto);

    // Map từ Entity sang Response để trả về Frontend [cite: 2026-02-25]
    @Mapping(target = "branchName", source = "branch.name")
    @Mapping(target = "modelName", source = "entity", qualifiedByName = "mapModelName")
    AppraisalResponse toResponse(AppraisalRequest entity);

    @Named("mapModelName")
    default String mapModelName(AppraisalRequest entity) {
        if (entity.getModel() != null) {
            return entity.getModel().getName();
        }
        return entity.getModelName();
    }
}
