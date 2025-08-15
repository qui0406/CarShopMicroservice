package com.tlaq.main_service.mapper;

import com.tlaq.main_service.dto.requests.carRequest.CarServiceRequest;
import com.tlaq.main_service.dto.responses.carResponse.CarServiceResponse;
import com.tlaq.main_service.entity.CarService;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CarServiceMapper {
    CarService toCarService(CarServiceRequest carServiceRequest);

    CarServiceResponse toCarServiceResponse(CarService carService);
}
