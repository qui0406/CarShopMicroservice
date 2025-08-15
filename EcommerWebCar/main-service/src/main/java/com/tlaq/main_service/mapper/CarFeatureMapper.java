package com.tlaq.main_service.mapper;

import com.tlaq.main_service.dto.requests.carRequest.CarFeatureRequest;
import com.tlaq.main_service.dto.responses.carResponse.CarFeatureResponse;
import com.tlaq.main_service.entity.CarFeature;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CarFeatureMapper {
    CarFeature toCarFeature(CarFeatureRequest carFeatureRequest);

    CarFeatureResponse toCarFeatureResponse(CarFeature carFeature);
}
