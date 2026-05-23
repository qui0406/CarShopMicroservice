package com.tlaq.catalog_service.mapper;

import com.tlaq.catalog_service.dto.request.CarRequest;
import com.tlaq.catalog_service.dto.request.EquipmentRequest;
import com.tlaq.catalog_service.dto.request.TechSpecRequest;
import com.tlaq.catalog_service.dto.response.CarResponse;
import com.tlaq.catalog_service.dto.response.CarSummaryResponse;
import com.tlaq.catalog_service.dto.response.ListCarStaffResponse;
import com.tlaq.catalog_service.entity.Car;
import com.tlaq.catalog_service.entity.CarImage;
import com.tlaq.catalog_service.entity.Equipment;
import com.tlaq.catalog_service.entity.TechnicalSpec;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.Collections;
import java.util.List;

@Mapper(componentModel = "spring", uses = {CarModelMapper.class, TechSpecMapper.class, EquipmentMapper.class})
public interface CarMapper {

    // Khi trả về CarResponse, nó sẽ tự động dùng CarModelMapper để map field carModel
    @Mapping(target = "imageUrls", expression = "java(mapCarImages(car.getCarImages()))")
    @Mapping(target = "thumbnail", source = "thumbnail")
    @Mapping(target = "fuelType", source = "technicalSpec.fuelType")
    @Mapping(target = "name", expression = "java(formatCarName(car))")
    @Mapping(target = "showRoomId", source = "showRoom.id")
    @Mapping(target = "showRoomName", source = "showRoom.name")
    CarResponse toCarResponse(Car car);

    default String formatCarName(Car car) {
        if (car == null || car.getCarModel() == null) return "Unknown Car";
        String branchName = (car.getCarModel().getCarBranch() != null) ? car.getCarModel().getCarBranch().getName().trim() : "";
        String modelName = (car.getCarModel().getName() != null) ? car.getCarModel().getName().trim() : "";
        String trimLevel = (car.getTechnicalSpec() != null && car.getTechnicalSpec().getTrimLevel() != null) 
                            ? car.getTechnicalSpec().getTrimLevel().trim() : "";

        String fullName;
        if (!branchName.isEmpty() && modelName.toLowerCase().contains(branchName.toLowerCase())) {
            fullName = modelName;
        } else {
            fullName = branchName + " " + modelName;
        }

        if (!trimLevel.isEmpty() && !fullName.toLowerCase().contains(trimLevel.toLowerCase())) {
            fullName += " " + trimLevel;
        }
        return fullName.replaceAll("\\s+", " ").trim();
    }

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "carModel", ignore = true) // Thường mình set bằng tay trong Service
    @Mapping(target = "showRoom", ignore = true)
    Car toCar(CarRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "carModel", ignore = true)
    @Mapping(target = "carImages", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "showRoom", ignore = true)
    void updateCar(@MappingTarget Car car, CarRequest request);

    default List<String> mapCarImages(List<CarImage> carImages) {
        if (carImages == null || carImages.isEmpty()) return Collections.emptyList();
        return carImages.stream().map(CarImage::getImage).toList();
    }

    @Mapping(target = "name", expression = "java(car.getCarModel().getName())")
    @Mapping(target = "thumbnail", source = "thumbnail")
    @Mapping(target = "seatCapacity", source = "carModel.seatCapacity")
    @Mapping(target = "fuelType", source = "technicalSpec.fuelType")
    @Mapping(target = "engineSize", source = "technicalSpec.engineSize")
    CarSummaryResponse toCarSummaryResponse(Car car);

    List<CarSummaryResponse> toListCarSummaryResponses(List<Car> cars);

    @Mapping(target = "carName", expression = "java(formatCarName(car))")
    @Mapping(target = "carBranch", source = "carModel.carBranch.name")
    @Mapping(target = "category", source = "carModel.category.name")
    @Mapping(target = "year", source = "manufacturingYear")
    @Mapping(target = "isReady", source = "ready")
    ListCarStaffResponse toListCarStaffResponse(Car car);

    List<ListCarStaffResponse> toListCarStaffResponses(List<Car> cars);
}