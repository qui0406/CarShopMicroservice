package com.tlaq.catalog_service.service.impl;

import com.tlaq.catalog_service.dto.request.CarSpecificationRequest;
import com.tlaq.catalog_service.dto.response.CarSpecificationResponse;
import com.tlaq.catalog_service.entity.CarSpecification;
import com.tlaq.catalog_service.mapper.CarSpecificationMapper;
import com.tlaq.catalog_service.repo.CarSpecificationRepository;
import com.tlaq.catalog_service.service.CarSpecificationService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CarSpecificationServiceImpl implements CarSpecificationService {
    CarSpecificationRepository carSpecificationRepository;
    CarSpecificationMapper carSpecificationMapper;

    @Override
    public CarSpecificationResponse create(CarSpecificationRequest request) {
        CarSpecification specification = carSpecificationMapper.toEntity(request);
        specification = carSpecificationRepository.save(specification);
        return carSpecificationMapper.toResponse(specification);
    }

    @Override
    public List<CarSpecificationResponse> findAll() {
        return carSpecificationRepository.findAll().stream()
                .map(carSpecificationMapper::toResponse)
                .toList();
    }

    @Override
    public CarSpecificationResponse getByCarId(Long carId) {
        return carSpecificationRepository.findById(carId)
                .map(carSpecificationMapper::toResponse)
                .orElseThrow(() -> new RuntimeException("Car Specification not found with id: " + carId));
    }

    @Override
    public CarSpecificationResponse update(Long carId, CarSpecificationRequest request) {
        CarSpecification specification = carSpecificationRepository.findById(carId)
                .orElseThrow(() -> new RuntimeException("Car Specification not found"));

        carSpecificationMapper.updateEntity(specification, request);
        return carSpecificationMapper.toResponse(carSpecificationRepository.save(specification));
    }

    @Override
    public void delete(Long carId) {
        if (!carSpecificationRepository.existsById(carId)) {
            throw new RuntimeException("Car Specification not found");
        }
        carSpecificationRepository.deleteById(carId);
    }
}
