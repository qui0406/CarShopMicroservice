package com.tlaq.catalog_service.mapper;

import com.tlaq.catalog_service.dto.request.CarRequest;
import com.tlaq.catalog_service.dto.request.EquipmentRequest;
import com.tlaq.catalog_service.dto.request.TechSpecRequest;
import com.tlaq.catalog_service.dto.response.CarResponse;
import com.tlaq.catalog_service.dto.response.CarSummaryResponse;
import com.tlaq.catalog_service.entity.Car;
import com.tlaq.catalog_service.entity.CarImage;
import com.tlaq.catalog_service.entity.Equipment;
import com.tlaq.catalog_service.entity.TechnicalSpec;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.Collections;
import java.util.List;

@Mapper(componentModel = "spring", uses = {CarModelMapper.class})
public interface CarMapper {

    // Khi trả về CarResponse, nó sẽ tự động dùng CarModelMapper để map field carModel
    @Mapping(target = "imageUrls", expression = "java(mapCarImages(car.getCarImages()))")
    @Mapping(target = "fuelType", source = "carModel.technicalSpec.fuelType")
    CarResponse toCarResponse(Car car);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "carModel", ignore = true) // Thường mình set bằng tay trong Service
    Car toCar(CarRequest request);

    default List<String> mapCarImages(List<CarImage> carImages) {
        if (carImages == null || carImages.isEmpty()) return Collections.emptyList();
        return carImages.stream().map(CarImage::getImage).toList();
    }

    @Mapping(target = "name", expression = "java(car.getCarModel().getName())")
    @Mapping(target = "thumbnail", expression = "java(car.getCarImages().isEmpty() ? null : car.getCarImages().get(0).getImage())")
    @Mapping(target = "seatCapacity", source = "carModel.seatCapacity")
    @Mapping(target = "fuelType", source = "carModel.technicalSpec.fuelType")
    @Mapping(target = "engineSize", source = "carModel.technicalSpec.engineSize")
    CarSummaryResponse toCarSummaryResponse(Car car);

    List<CarSummaryResponse> toListCarSummaryResponses(List<Car> cars);
}