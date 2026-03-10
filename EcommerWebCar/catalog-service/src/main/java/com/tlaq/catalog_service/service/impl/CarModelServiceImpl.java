package com.tlaq.catalog_service.service.impl;

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
import com.tlaq.catalog_service.service.CarModelService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Service
public class CarModelServiceImpl implements CarModelService {
    CarModelRepository carModelRepository;
    CarModelMapper carModelMapper;
    CarCategoryRepository carCategoryRepository;
    CarBranchRepository carBranchRepository;

    @Override
    public List<CarModelResponse> getAll() {
        List<CarModel> carModelResponses = carModelRepository.findAll();
        return carModelMapper.toListCarModel(carModelResponses);
    }

    @Override
    public CarModelResponse getById(Long id) {
        return carModelMapper.toCarModelResponse(carModelRepository.findById(id)
                .orElseThrow(()-> new AppException(ErrorCode.MODEL_CAR_IS_EMPTY)));
    }

    @Override
    public CarModelResponse create(CarModelRequest request) {
        // 1. Tìm Category (Phân khúc: SUV, Sedan...) [cite: 2026-03-09]
        CarCategory category = carCategoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new AppException(ErrorCode.CAR_CATEGORY_IS_EMPTY));

        // 2. Tìm CarBranch (Hãng xe: Hyundai, BMW...) [cite: 2026-03-09]
        CarBranch branch = carBranchRepository.findById(request.getCarBranchId())
                .orElseThrow(() -> new AppException(ErrorCode.CAR_BRANCH_NOT_FOUND));

        // 3. Map từ request sang entity [cite: 2026-03-09]
        CarModel carModel = carModelMapper.toCarModel(request);

        // 4. THIẾT LẬP MỐI QUAN HỆ (Quan trọng để tránh NULL database) [cite: 2026-03-05, 2026-03-09]
        carModel.setCategory(category);
        carModel.setCarBranch(branch);

        // 5. Lưu và trả về response [cite: 2026-03-09]
        return carModelMapper.toCarModelResponse(carModelRepository.save(carModel));
    }

    @Override
    public void deleteById(Long id) {
        carModelRepository.deleteById(id);
    }
}
