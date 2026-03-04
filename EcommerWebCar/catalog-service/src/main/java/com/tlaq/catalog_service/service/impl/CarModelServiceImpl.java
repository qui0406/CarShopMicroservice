package com.tlaq.catalog_service.service.impl;

import com.tlaq.catalog_service.dto.request.CarModelRequest;
import com.tlaq.catalog_service.dto.response.CarModelResponse;
import com.tlaq.catalog_service.entity.CarModel;
import com.tlaq.catalog_service.exceptions.AppException;
import com.tlaq.catalog_service.exceptions.ErrorCode;
import com.tlaq.catalog_service.mapper.CarModelMapper;
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
        CarModel carModel = carModelMapper.toCarModel(request);
        carModel = carModelRepository.save(carModel);
        return carModelMapper.toCarModelResponse(carModel);
    }

    @Override
    public void deleteById(Long id) {
        carModelRepository.deleteById(id);
    }
}
