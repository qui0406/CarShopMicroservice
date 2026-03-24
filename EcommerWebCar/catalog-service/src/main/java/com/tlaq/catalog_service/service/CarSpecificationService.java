package com.tlaq.catalog_service.service;

import com.tlaq.catalog_service.dto.request.EquipmentRequest;
import com.tlaq.catalog_service.dto.response.EquipmentResponse;

import java.util.List;

public interface CarSpecificationService {
    EquipmentResponse create(EquipmentRequest equipmentRequest);
    List<EquipmentResponse> findAll();
    EquipmentResponse getByCarId(Long carId);
    EquipmentResponse update(Long carId, EquipmentRequest equipmentRequest);
    void delete(Long carId);
}
