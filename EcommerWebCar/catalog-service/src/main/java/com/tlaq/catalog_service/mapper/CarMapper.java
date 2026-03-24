package com.tlaq.catalog_service.mapper;

import com.tlaq.catalog_service.dto.request.CarRequest;
import com.tlaq.catalog_service.dto.request.EquipmentRequest;
import com.tlaq.catalog_service.dto.request.TechSpecRequest;
import com.tlaq.catalog_service.dto.response.CarResponse;
import com.tlaq.catalog_service.entity.Car;
import com.tlaq.catalog_service.entity.CarImage;
import com.tlaq.catalog_service.entity.Equipment;
import com.tlaq.catalog_service.entity.TechnicalSpec;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.Collections;
import java.util.List;

@Mapper(componentModel = "spring")
public interface CarMapper {
    // Thêm 2 dòng này để MapStruct biết cách xử lý TechSpec và Equipment [cite: 2026-03-09]
    TechnicalSpec toTechnicalSpec(TechSpecRequest request);
    Equipment toEquipment(EquipmentRequest request);

    @Mapping(target = "equipment", source = "equipment")
    @Mapping(target = "technicalSpec", source = "technicalSpec")
    Car toCar(CarRequest request);

    @Mapping(target = "images", expression = "java(mapCarImages(car.getCarImages()))")
    CarResponse toCarResponse(Car car);

    default List<String> mapCarImages(List<CarImage> carImages) {
        if (carImages == null || carImages.isEmpty()) {
            return Collections.emptyList();
        }
        return carImages.stream()
                .map(CarImage::getImage)
                .toList();
    }
}