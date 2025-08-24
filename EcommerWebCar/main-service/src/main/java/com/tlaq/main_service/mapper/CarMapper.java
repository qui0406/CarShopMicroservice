package com.tlaq.main_service.mapper;

import com.tlaq.main_service.dto.requests.carRequest.CarRequest;
import com.tlaq.main_service.dto.responses.carResponse.CarDetailsResponse;
import com.tlaq.main_service.dto.responses.carResponse.CarResponse;
import com.tlaq.main_service.entity.Car;
import com.tlaq.main_service.entity.CarCategory;
import com.tlaq.main_service.entity.CarImage;
import com.tlaq.main_service.entity.CarModel;
import com.tlaq.main_service.mapper.decorator.CarMapperDecorator;
import org.mapstruct.*;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
@DecoratedWith(CarMapperDecorator.class)
public interface CarMapper {
    @Mapping(target = "carModel", source = "carModel") // từ Long trong request
    Car toCar(CarRequest carRequest);

    @Mapping(target = "carModel", source = "carModel")
    CarResponse toCarResponse(Car car);

    @Mapping(target = "images", source = "carImages", qualifiedByName = "mapCarImages")
    CarDetailsResponse toCarDetailsResponse(Car car);

    default CarModel map(Long id) {
        if (id == null) return null;
        CarModel carModel = new CarModel();
        carModel.setId(id);
        return carModel;
    }

    default String map(CarModel carModel) {
        return carModel != null ? carModel.getName() : null;
    }

    default String map(CarCategory category) {
        return category != null ? category.getName() : null;
    }

    @Named("mapCarImages")
    default List<String> mapCarImages(List<CarImage> carImages) {
        if (carImages == null) return new ArrayList<>();
        return carImages.stream()
                .map(CarImage::getImage)
                .collect(Collectors.toList());
    }

}
