package com.tlaq.catalog_service.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
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
import com.tlaq.catalog_service.dto.PageResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

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
    public PageResponse<CarModelResponse> getAll(int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<CarModel> carModelPage = carModelRepository.findAll(pageable);

        return PageResponse.<CarModelResponse>builder()
                .currentPage(page)
                .pageSize(carModelPage.getSize())
                .totalPages(carModelPage.getTotalPages())
                .totalElements(carModelPage.getTotalElements())
                .data(carModelMapper.toListCarModel(carModelPage.getContent()))
                .build();
    }

    @Override
    public CarModelResponse getById(Long id) {
        return carModelMapper.toCarModelResponse(carModelRepository.findById(id)
                .orElseThrow(()-> new AppException(ErrorCode.MODEL_CAR_IS_EMPTY)));
    }

    @Override
    public CarModelResponse create(CarModelRequest request) {
        // 1. Tìm Category (Phân khúc: SUV, Sedan...)
        CarCategory category = carCategoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new AppException(ErrorCode.CAR_CATEGORY_IS_EMPTY));

        // 2. Tìm CarBranch (Hãng xe: Hyundai, BMW...)
        CarBranch branch = carBranchRepository.findById(request.getCarBranchId())
                .orElseThrow(() -> new AppException(ErrorCode.CAR_BRANCH_NOT_FOUND));

        // 3. Map từ request sang entity
        CarModel carModel = carModelMapper.toCarModel(request);

        // 4. THIẾT LẬP MỐI QUAN HỆ (Quan trọng để tránh NULL database)
        carModel.setCategory(category);
        carModel.setCarBranch(branch);

        // 6. Lưu và trả về response
        return carModelMapper.toCarModelResponse(carModelRepository.save(carModel));
    }

    @Override
    public void deleteById(Long id) {
        carModelRepository.deleteById(id);
    }
}
