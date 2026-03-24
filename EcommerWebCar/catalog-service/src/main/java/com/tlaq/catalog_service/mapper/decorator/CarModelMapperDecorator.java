package com.tlaq.catalog_service.mapper.decorator;

import com.tlaq.catalog_service.dto.request.CarModelRequest;
import com.tlaq.catalog_service.dto.response.CarModelResponse;
import com.tlaq.catalog_service.entity.CarBranch;
import com.tlaq.catalog_service.entity.CarCategory;
import com.tlaq.catalog_service.entity.CarModel;
import com.tlaq.catalog_service.exceptions.AppException;
import com.tlaq.catalog_service.exceptions.ErrorCode;
import com.tlaq.catalog_service.mapper.CarModelMapper;
import com.tlaq.catalog_service.repo.CarBranchRepository;
import com.tlaq.catalog_service.repo.CarCategoryRepository;
import com.tlaq.catalog_service.repo.CarModelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

@Component
public abstract class CarModelMapperDecorator implements CarModelMapper {
    @Autowired
    @Qualifier("delegate")
    CarModelMapper delegate;

    @Autowired
    CarModelRepository carModelRepository;

    @Autowired
    CarCategoryRepository carCategoryRepository;

    @Autowired
    CarBranchRepository carBranchRepository;

    @Override
    public CarModel toCarModel(CarModelRequest carModelRequest) {
        CarBranch carBranch = carBranchRepository.findById(carModelRequest.getCarBranchId())
                .orElseThrow(()-> new AppException(ErrorCode.CAR_CATEGORY_IS_EMPTY));

        CarCategory category = carCategoryRepository.findById(carModelRequest.getCategoryId())
                .orElseThrow(()-> new AppException(ErrorCode.CAR_CATEGORY_IS_EMPTY));

        return CarModel.builder()
                .name(carModelRequest.getName())
                .carBranch(carBranch)
                .category(category)
                .build();
    }

    @Override
    public CarModelResponse toCarModelResponse(CarModel carModel) {
        CarModel response = carModelRepository.findById(carModel.getId())
                .orElseThrow(()-> new AppException(ErrorCode.MODEL_CAR_IS_EMPTY));
        return CarModelResponse.builder()
                .id(carModel.getId())
                .name(carModel.getName())
                .category(CarModelResponse.CarCategoryResponse.builder()
                        .id(response.getId())
                        .name(response.getName())
                        .build())
                .carBranch(CarModelResponse.CarBranchResponse.builder()
                        .id(response.getId())
                        .name(response.getName())
                        .build())
                .build();
    }
}
