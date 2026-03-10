package com.tlaq.catalog_service.service.impl;

import com.tlaq.catalog_service.dto.request.EquipmentRequest;
import com.tlaq.catalog_service.dto.response.EquipmentResponse;
import com.tlaq.catalog_service.entity.Equipment;
import com.tlaq.catalog_service.mapper.EquipmentMapper;
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
    EquipmentMapper equipmentMapper;

    @Override
    public EquipmentResponse create(EquipmentRequest request) {
        Equipment specification = equipmentMapper.toEntity(request);
        specification = carSpecificationRepository.save(specification);
        return equipmentMapper.toResponse(specification);
    }

    @Override
    public List<EquipmentResponse> findAll() {
        return carSpecificationRepository.findAll().stream()
                .map(equipmentMapper::toResponse)
                .toList();
    }

    @Override
    public EquipmentResponse getByCarId(Long carId) {
        return carSpecificationRepository.findById(carId)
                .map(equipmentMapper::toResponse)
                .orElseThrow(() -> new RuntimeException("Car Specification not found with id: " + carId));
    }

    @Override
    public EquipmentResponse update(Long carId, EquipmentRequest request) {
        Equipment specification = carSpecificationRepository.findById(carId)
                .orElseThrow(() -> new RuntimeException("Car Specification not found"));

        equipmentMapper.updateEntity(specification, request);
        return equipmentMapper.toResponse(carSpecificationRepository.save(specification));
    }

    @Override
    public void delete(Long carId) {
        if (!carSpecificationRepository.existsById(carId)) {
            throw new RuntimeException("Car Specification not found");
        }
        carSpecificationRepository.deleteById(carId);
    }
}
