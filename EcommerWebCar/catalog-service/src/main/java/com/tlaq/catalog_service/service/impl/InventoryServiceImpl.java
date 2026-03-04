package com.tlaq.catalog_service.service.impl;

import com.tlaq.catalog_service.dto.request.InventoryRequest;
import com.tlaq.catalog_service.dto.request.InventoryUpdateRequest;
import com.tlaq.catalog_service.dto.response.InventoryResponse;
import com.tlaq.catalog_service.entity.Inventory;
import com.tlaq.catalog_service.exceptions.AppException;
import com.tlaq.catalog_service.exceptions.ErrorCode;
import com.tlaq.catalog_service.mapper.InventoryMapper;
import com.tlaq.catalog_service.repo.CarRepository;
import com.tlaq.catalog_service.repo.InventoryRepository;
import com.tlaq.catalog_service.service.InventoryService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Service
public class InventoryServiceImpl implements InventoryService {
    InventoryMapper inventoryMapper;
    InventoryRepository inventoryRepository;
    CarRepository carRepository;

    @Override
    public InventoryResponse get(String inventoryId) {
        Inventory inventory = inventoryRepository.findById(inventoryId)
                .orElseThrow(()-> new AppException(ErrorCode.INVENTORY_IS_EMPTY));
        return inventoryMapper.toInventoryResponse(inventory);
    }

    @Override
    public InventoryResponse create(InventoryRequest request) {
        carRepository.findById(request.getCarId())
                .orElseThrow(()-> new AppException(ErrorCode.INVENTORY_CAR_EXISTS));

        Inventory inventory = inventoryMapper.toInventory(request);
        return inventoryMapper.toInventoryResponse(inventoryRepository.save(inventory));
    }

    @Override
    public InventoryResponse update(InventoryUpdateRequest request, String inventoryId) {
        Inventory inventory = inventoryRepository.findById(inventoryId)
                .orElseThrow(()-> new AppException(ErrorCode.INVENTORY_IS_EMPTY));
        inventory.setQuantity(request.getQuantity());
        return inventoryMapper.toInventoryResponse(inventoryRepository.save(inventory));
    }

    @Override
    public void delete(String inventoryId) {
        Inventory inventory = inventoryRepository.findById(inventoryId)
                .orElseThrow(()-> new AppException(ErrorCode.INVENTORY_IS_EMPTY));
        inventoryRepository.delete(inventory);
    }

    @Override
    public void updateInventoryAfterPay(String orderId) {

    }

    @Override
    public void restoreInventory(String orderId) {

    }

    @Override
    public InventoryResponse getInventoryByCarId(String carId) {
        Inventory inventory= inventoryRepository.findInventoryByCarId(carId)
                .orElseThrow(()-> new AppException(ErrorCode.INVENTORY_IS_EMPTY));
        return inventoryMapper.toInventoryResponse(inventoryRepository.save(inventory));
    }
}
