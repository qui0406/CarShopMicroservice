package com.tlaq.main_service.mapper;

import com.tlaq.main_service.dto.requests.carRequest.CarTypeRequest;
import com.tlaq.main_service.dto.responses.carResponse.CarTypeResponse;
import com.tlaq.main_service.entity.CarType;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CarTypeMapper {
    CarType toCarType(CarTypeRequest carTypeRequest);

    CarTypeResponse toCarTypeResponse(CarType carType);
}
