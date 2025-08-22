package com.tlaq.main_service.services.impl;

import com.tlaq.main_service.dto.requests.carRequest.CarCategoryRequest;
import com.tlaq.main_service.dto.responses.carResponse.CarCategoryResponse;
import com.tlaq.main_service.entity.CarCategory;
import com.tlaq.main_service.exceptions.AppException;
import com.tlaq.main_service.exceptions.ErrorCode;
import com.tlaq.main_service.mapper.CarCategoryMapper;
import com.tlaq.main_service.repositories.CarCategoryRepository;
import com.tlaq.main_service.services.CarCategoryService;
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
public class CarCategoryServiceImpl implements CarCategoryService {
    CarCategoryRepository carCategoryRepository;
    CarCategoryMapper carCategoryMapper;

    @Override
    public CarCategoryResponse getCarCategoryById(Long id) {
        return carCategoryMapper.toResponse(carCategoryRepository.findById(id)
                .orElseThrow(()->new AppException(ErrorCode.CAR_CATEGORY_IS_EMPTY)));
    }

    @Override
    public List<CarCategoryResponse> getCarCategories() {
        return carCategoryMapper.toResponseList(carCategoryRepository.findAll());
    }

    @Override
    public CarCategoryResponse create(CarCategoryRequest carCategoryRequest) {
        CarCategory carCategory = carCategoryMapper.toResponse(carCategoryRequest);
        return carCategoryMapper.toResponse(carCategoryRepository.save(carCategory));
    }

    @Override
    public void delete(Long id) {
        carCategoryRepository.deleteById(id);
    }
}
