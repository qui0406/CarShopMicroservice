package com.tlaq.catalog_service.mapper;

import com.tlaq.catalog_service.dto.request.CarBranchRequest;
import com.tlaq.catalog_service.dto.response.CarBranchResponse;
import com.tlaq.catalog_service.entity.CarBranch;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CarBranchMapper {
    @Mapping(source = "imageBranch", target = "imageBranch")
    CarBranchResponse toDto(CarBranch carBranch);

    List<CarBranchResponse> toDto(List<CarBranch> carBranch);

    CarBranch toEntity(CarBranchRequest request);
}
