package com.tlaq.catalog_service.mapper;

import com.tlaq.catalog_service.dto.request.AppraisalRequestDto;
import com.tlaq.catalog_service.dto.response.AppraisalResponse;
import com.tlaq.catalog_service.entity.AppraisalRequest;
import com.tlaq.catalog_service.entity.CarBranch;
import com.tlaq.catalog_service.entity.CarModel;
import com.tlaq.catalog_service.repo.CarBranchRepository;
import com.tlaq.catalog_service.repo.CarModelRepository;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper(componentModel = "spring")
public abstract class AppraisalMapper {
    @Autowired
    protected CarBranchRepository branchRepository;

    @Autowired
    protected CarModelRepository modelRepository;

    // Map từ DTO sang Entity để lưu Database [cite: 2026-02-25]
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "branch", source = "branchId", qualifiedByName = "idToBranch")
    @Mapping(target = "model", source = "modelId", qualifiedByName = "idToModel")
    @Mapping(target = "images", ignore = true) // Xử lý riêng khi upload Cloudinary [cite: 2026-02-25]
    @Mapping(target = "status", constant = "PENDING")
    public abstract AppraisalRequest toEntity(AppraisalRequestDto dto);

    // Map từ Entity sang Response để trả về Frontend [cite: 2026-02-25]
    @Mapping(target = "branchName", source = "branch.name")
    @Mapping(target = "modelName", source = "model.name")
    public abstract AppraisalResponse toResponse(AppraisalRequest entity);

    // Các hàm bổ trợ tìm kiếm Entity từ ID [cite: 2026-02-25]
    @Named("idToBranch")
    protected CarBranch idToBranch(Long id) {
        return branchRepository.findById(id).orElse(null);
    }

    @Named("idToModel")
    protected CarModel idToModel(Long id) {
        return modelRepository.findById(id).orElse(null);
    }
}
