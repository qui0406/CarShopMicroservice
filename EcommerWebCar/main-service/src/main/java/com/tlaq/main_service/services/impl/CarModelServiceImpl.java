package com.tlaq.main_service.services.impl;

import com.tlaq.main_service.dto.requests.carRequest.CarModelRequest;
import com.tlaq.main_service.dto.responses.carResponse.CarModelResponse;
import com.tlaq.main_service.entity.CarModel;
import com.tlaq.main_service.exceptions.AppException;
import com.tlaq.main_service.exceptions.ErrorCode;
import com.tlaq.main_service.mapper.CarModelMapper;
import com.tlaq.main_service.repositories.CarModelRepository;
import com.tlaq.main_service.services.CarModelService;
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
        return carModelMapper.toCarBranchResponse(carModelResponses);
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
