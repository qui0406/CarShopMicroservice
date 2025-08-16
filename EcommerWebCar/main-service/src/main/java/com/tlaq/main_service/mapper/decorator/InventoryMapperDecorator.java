package com.tlaq.main_service.mapper.decorator;

import com.tlaq.main_service.dto.requests.inventoryRequest.InventoryRequest;
import com.tlaq.main_service.dto.responses.InventoryResponse;
import com.tlaq.main_service.entity.Car;
import com.tlaq.main_service.entity.Inventory;
import com.tlaq.main_service.exceptions.AppException;
import com.tlaq.main_service.exceptions.ErrorCode;
import com.tlaq.main_service.mapper.InventoryMapper;
import com.tlaq.main_service.repositories.CarRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

@Component
public class InventoryMapperDecorator implements InventoryMapper {
    @Autowired
    @Qualifier("delegate")
    private InventoryMapper delegate;

    @Autowired
    private CarRepository carRepository;

    @Override
    public Inventory toInventory(InventoryRequest request) {
        Inventory inventory = delegate.toInventory(request);
        Car car = carRepository.findById(request.getCarId()).orElseThrow(()-> new AppException(ErrorCode.CAR_NOT_FOUND));
        inventory.setCar(car);
        return inventory;
    }

    @Override
    public InventoryResponse toInventoryResponse(Inventory inventory) {
        return InventoryResponse.builder()
                .id(inventory.getId())
                .createdAt(inventory.getCreatedAt())
                .quantity(inventory.getQuantity())
                .car(InventoryResponse.Car.builder()
                        .id(inventory.getCar().getId())
                        .name(inventory.getCar().getName())
                        .build())
                .build();


    }
}
