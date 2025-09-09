package com.tlaq.main_service.services.impl;

import com.tlaq.main_service.dto.requests.inventoryRequest.InventoryRequest;
import com.tlaq.main_service.dto.requests.inventoryRequest.InventoryUpdateRequest;
import com.tlaq.main_service.dto.responses.InventoryResponse;
import com.tlaq.main_service.entity.Car;
import com.tlaq.main_service.entity.Inventory;
import com.tlaq.main_service.exceptions.AppException;
import com.tlaq.main_service.exceptions.ErrorCode;
import com.tlaq.main_service.mapper.InventoryMapper;
import com.tlaq.main_service.repositories.CarRepository;
import com.tlaq.main_service.repositories.InventoryRepository;
import com.tlaq.main_service.repositories.OrdersRepository;
import com.tlaq.main_service.services.InventoryService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class InventoryServiceImpl implements InventoryService {
    InventoryMapper inventoryMapper;
    InventoryRepository inventoryRepository;
    OrdersRepository ordersRepository;
    CarRepository carRepository;

    @Override
    public InventoryResponse getInventory(String inventoryId) {
        Inventory inventory = inventoryRepository.findById(inventoryId)
                .orElseThrow(()-> new AppException(ErrorCode.INVENTORY_IS_EMPTY));
        return inventoryMapper.toInventoryResponse(inventory);
    }

    @Override
    public InventoryResponse createInventory(InventoryRequest request) {
        carRepository.findById(request.getCarId())
                .orElseThrow(()-> new AppException(ErrorCode.INVENTORY_CAR_EXISTS));

        Inventory inventory = inventoryMapper.toInventory(request);
        return inventoryMapper.toInventoryResponse(inventoryRepository.save(inventory));
    }

    @Override
    public InventoryResponse updateInventory(InventoryUpdateRequest request, String inventoryId) {
        Inventory inventory = inventoryRepository.findById(inventoryId)
                .orElseThrow(()-> new AppException(ErrorCode.INVENTORY_IS_EMPTY));
        inventory.setQuantity(request.getQuantity());
        return inventoryMapper.toInventoryResponse(inventoryRepository.save(inventory));
    }

    @Override
    public void deleteInventory(String inventoryId) {
        Inventory inventory = inventoryRepository.findById(inventoryId)
                .orElseThrow(()-> new AppException(ErrorCode.INVENTORY_IS_EMPTY));
        inventoryRepository.delete(inventory);
    }

    @Override
    public void updateInventoryAfterPay(String orderId) {
        String carId= String.valueOf(ordersRepository.findById(orderId)
                .orElseThrow(()-> new AppException(ErrorCode.ORDER_IS_EMPTY)).getCar().getId());

        Inventory inventory= inventoryRepository.findInventoryByCarId(carId)
                .orElseThrow(()-> new AppException(ErrorCode.INVENTORY_IS_EMPTY));

        int quantity = ordersRepository.findById(orderId)
                .orElseThrow(()-> new AppException(ErrorCode.INVENTORY_IS_EMPTY))
                .getOrderDetails().getQuantity();

        inventory.setQuantity(inventory.getQuantity() - quantity);
        log.info("Cap nhat thanh cong");
        inventoryRepository.save(inventory);
    }

    @Override
    public void restoreInventory(String orderId) {
        String carId= String.valueOf(ordersRepository.findById(orderId)
                .orElseThrow(()-> new AppException(ErrorCode.ORDER_IS_EMPTY)).getCar().getId());

        Inventory inventory= inventoryRepository.findInventoryByCarId(carId)
                .orElseThrow(()-> new AppException(ErrorCode.INVENTORY_IS_EMPTY));

        int quantity = ordersRepository.findById(orderId)
                .orElseThrow(()-> new AppException(ErrorCode.INVENTORY_IS_EMPTY))
                .getOrderDetails().getQuantity();

        inventory.setQuantity(inventory.getQuantity() + quantity);
        inventoryRepository.save(inventory);
    }

    @Override
    public InventoryResponse getInventoryByCarId(String carId) {
        Inventory inventory= inventoryRepository.findInventoryByCarId(carId)
                .orElseThrow(()-> new AppException(ErrorCode.INVENTORY_IS_EMPTY));

        return inventoryMapper.toInventoryResponse(inventoryRepository.save(inventory));
    }
}
