package com.tlaq.main_service.mapper;

import com.tlaq.main_service.dto.requests.carRequest.CarBranchRequest;
import com.tlaq.main_service.dto.responses.carResponse.CarBranchResponse;
import com.tlaq.main_service.entity.CarBranch;
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
