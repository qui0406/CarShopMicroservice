package com.tlaq.main_service.mapper;

import com.tlaq.main_service.dto.requests.carRequest.CarRequest;
import com.tlaq.main_service.dto.responses.carResponse.CarResponse;
import com.tlaq.main_service.entity.Car;
import com.tlaq.main_service.entity.CarImage;
import com.tlaq.main_service.mapper.decorator.CarMapperDecorator;
import org.mapstruct.*;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
@DecoratedWith(CarMapperDecorator.class)
public interface CarMapper {
    Car toCar(CarRequest carRequest);

    @Mapping(target = "carImage", source = "carImages", qualifiedByName = "mapCarImages")
    CarResponse toCarResponse(Car car);


    @Named("mapCarImages")
    default List<String> mapCarImages(List<CarImage> carImages) {
        if (carImages == null) {
            return new ArrayList<>();
        }
        return carImages.stream()
                .map(CarImage::getImage)
                .collect(Collectors.toList());
    }
}
