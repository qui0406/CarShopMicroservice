package com.tlaq.main_service.mapper.decorator;

import com.tlaq.main_service.dto.requests.carRequest.CarModelRequest;
import com.tlaq.main_service.dto.responses.carResponse.CarModelResponse;
import com.tlaq.main_service.entity.CarBranch;
import com.tlaq.main_service.entity.CarCategory;
import com.tlaq.main_service.entity.CarModel;
import com.tlaq.main_service.exceptions.AppException;
import com.tlaq.main_service.exceptions.ErrorCode;
import com.tlaq.main_service.mapper.CarModelMapper;
import com.tlaq.main_service.repositories.CarBranchRepository;
import com.tlaq.main_service.repositories.CarCategoryRepository;
import com.tlaq.main_service.repositories.CarModelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class CarModelMapperDecorator implements CarModelMapper {
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
                .category(response.getCategory().getName())
                .brand(response.getCarBranch().getName())
                .build();
    }

    @Override
    public List<CarModelResponse> toCarBranchResponse(List<CarModel> request) {
        return delegate.toCarBranchResponse(request);
    }
}
