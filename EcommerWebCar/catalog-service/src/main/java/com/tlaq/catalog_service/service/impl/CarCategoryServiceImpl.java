package com.tlaq.catalog_service.service.impl;

import com.tlaq.catalog_service.dto.request.CarCategoryRequest;
import com.tlaq.catalog_service.dto.response.CarCategoryResponse;
import com.tlaq.catalog_service.entity.CarCategory;
import com.tlaq.catalog_service.exceptions.AppException;
import com.tlaq.catalog_service.exceptions.ErrorCode;
import com.tlaq.catalog_service.mapper.CarCategoryMapper;
import com.tlaq.catalog_service.repo.CarCategoryRepository;
import com.tlaq.catalog_service.service.CarCategoryService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import com.tlaq.catalog_service.dto.PageResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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
    public PageResponse<CarCategoryResponse> getCarCategories(int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<CarCategory> carCategoryPage = carCategoryRepository.findAll(pageable);

        return PageResponse.<CarCategoryResponse>builder()
                .currentPage(page)
                .pageSize(carCategoryPage.getSize())
                .totalPages(carCategoryPage.getTotalPages())
                .totalElements(carCategoryPage.getTotalElements())
                .data(carCategoryMapper.toResponseList(carCategoryPage.getContent()))
                .build();
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
