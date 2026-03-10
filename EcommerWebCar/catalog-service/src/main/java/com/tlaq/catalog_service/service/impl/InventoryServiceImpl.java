package com.tlaq.catalog_service.service.impl;

import com.tlaq.catalog_service.dto.request.InventoryRequest;
import com.tlaq.catalog_service.dto.request.InventoryUpdateRequest;
import com.tlaq.catalog_service.dto.response.InventoryResponse;
import com.tlaq.catalog_service.entity.Car;
import com.tlaq.catalog_service.entity.Inventory;
import com.tlaq.catalog_service.entity.ShowRoom;
import com.tlaq.catalog_service.exceptions.AppException;
import com.tlaq.catalog_service.exceptions.ErrorCode;
import com.tlaq.catalog_service.mapper.InventoryMapper;
import com.tlaq.catalog_service.repo.CarRepository;
import com.tlaq.catalog_service.repo.InventoryRepository;
import com.tlaq.catalog_service.repo.ShowRoomRepository;
import com.tlaq.catalog_service.service.InventoryService;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Optional;

@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Service
public class InventoryServiceImpl implements InventoryService {
    InventoryMapper inventoryMapper;
    InventoryRepository inventoryRepository;
    CarRepository carRepository;
    ShowRoomRepository showRoomRepository;

    @Override
    public InventoryResponse get(String inventoryId) {
        Inventory inventory = inventoryRepository.findById(inventoryId)
                .orElseThrow(()-> new AppException(ErrorCode.INVENTORY_IS_EMPTY));
        return inventoryMapper.toInventoryResponse(inventory);
    }

    @Override
    @Transactional
    public InventoryResponse create(InventoryRequest request) {
        // 1. Kiểm tra xe có tồn tại trong hệ thống không
        Car car = carRepository.findById(request.getCarId())
                .orElseThrow(() -> new AppException(ErrorCode.CAR_NOT_FOUND));

        // 2. Kiểm tra Showroom có tồn tại không
        ShowRoom showRoom = showRoomRepository.findById(request.getShowRoomId())
                .orElseThrow(() -> new AppException(ErrorCode.SHOWROOM_NOT_FOUND));

        // 3. Kiểm tra xem mẫu xe này ĐÃ CÓ trong kho của Showroom này chưa
        Optional<Inventory> existingInventory = inventoryRepository
                .findByCarIdAndShowRoomId(request.getCarId(), request.getShowRoomId());

        Inventory inventory;
        if (existingInventory.isPresent()) {
            inventory = existingInventory.get();
            inventory.setQuantity(inventory.getQuantity() + request.getQuantity());
        } else {
            inventory = inventoryMapper.toInventory(request);
            inventory.setCar(car);       // Gán object Car thực tế
            inventory.setShowRoom(showRoom); // Gán object ShowRoom thực tế
        }

        return inventoryMapper.toInventoryResponse(inventoryRepository.save(inventory));
    }

    @Override
    @Transactional // Luôn dùng Transactional cho các thao tác thay đổi DB
    public InventoryResponse update(InventoryUpdateRequest request, String inventoryId) {
        // 1. Tìm bản ghi kho theo ID
        Inventory inventory = inventoryRepository.findById(inventoryId)
                .orElseThrow(() -> new AppException(ErrorCode.INVENTORY_NOT_FOUND));

        // 2. Kiểm tra số lượng mới (đảm bảo không bị âm từ phía Request)
        if (request.getQuantity() < 0) {
            throw new AppException(ErrorCode.INVALID_QUANTITY);
        }

        // 3. Cập nhật số lượng
        inventory.setQuantity(request.getQuantity());

        // 4. Lưu và trả về
        return inventoryMapper.toInventoryResponse(inventoryRepository.save(inventory));
    }

    @Override
    @Transactional
    public void delete(String inventoryId) {
        // Kiểm tra tồn tại trước khi xóa để báo lỗi chính xác
        Inventory inventory = inventoryRepository.findById(inventoryId)
                .orElseThrow(() -> new AppException(ErrorCode.INVENTORY_NOT_FOUND));

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
