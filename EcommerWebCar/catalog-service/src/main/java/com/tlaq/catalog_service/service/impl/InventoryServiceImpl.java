package com.tlaq.catalog_service.service.impl;

import com.tlaq.catalog_service.dto.PageResponse;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

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
                .orElseThrow(() -> new AppException(ErrorCode.INVENTORY_NOT_FOUND));

        Car car = carRepository.findById(inventory.getCarId())
                .orElseThrow(() -> new AppException(ErrorCode.CAR_NOT_FOUND));

        return inventoryMapper.toInventoryResponse(inventory, car);
    }

    @Override
    @Transactional
    public InventoryResponse create(InventoryRequest request) {
        // 1. Check Car
        Car car = carRepository.findById(request.getCarId())
                .orElseThrow(() -> new AppException(ErrorCode.CAR_NOT_FOUND));

        // 2. Check Showroom
        ShowRoom showRoom = showRoomRepository.findById(request.getShowRoomId())
                .orElseThrow(() -> new AppException(ErrorCode.SHOWROOM_NOT_FOUND));

        // 3. Check exist
        Optional<Inventory> existingInventory = inventoryRepository
                .findByCarIdAndShowRoomId(request.getCarId(), request.getShowRoomId());

        Inventory inventory;
        if (existingInventory.isPresent()) {
            inventory = existingInventory.get();
            inventory.setQuantity(inventory.getQuantity() + request.getQuantity());
        } else {
            inventory = inventoryMapper.toInventory(request);
            inventory.setCarId(car.getId());
            inventory.setShowRoom(showRoom);
        }

        Inventory savedInventory = inventoryRepository.save(inventory);
        return inventoryMapper.toInventoryResponse(savedInventory, car);
    }

    @Override
    public Boolean checkStock(String carId, Integer quantity) {
        return inventoryRepository.findInventoryByCarId(carId)
                .map(inventory -> inventory.getQuantity() >= quantity)
                .orElse(false);
    }

    @Override
    @Transactional
    public InventoryResponse update(InventoryUpdateRequest request, String inventoryId) {
        Inventory inventory = inventoryRepository.findById(inventoryId)
                .orElseThrow(() -> new AppException(ErrorCode.INVENTORY_NOT_FOUND));

        if (request.getQuantity() < 0) {
            throw new AppException(ErrorCode.INVALID_QUANTITY);
        }

        inventory.setQuantity(request.getQuantity());
        Inventory savedInventory = inventoryRepository.save(inventory);

        Car car = carRepository.findById(savedInventory.getCarId())
                .orElseThrow(() -> new AppException(ErrorCode.CAR_NOT_FOUND));

        return inventoryMapper.toInventoryResponse(savedInventory, car);
    }

    @Override
    @Transactional
    public void delete(String inventoryId) {
        Inventory inventory = inventoryRepository.findById(inventoryId)
                .orElseThrow(() -> new AppException(ErrorCode.INVENTORY_NOT_FOUND));
        inventoryRepository.delete(inventory);
    }

    @Override
    public InventoryResponse getInventoryByCarId(String carId) {
        Inventory inventory = inventoryRepository.findInventoryByCarId(carId)
                .orElseThrow(() -> new AppException(ErrorCode.INVENTORY_IS_EMPTY));

        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new AppException(ErrorCode.CAR_NOT_FOUND));

        return inventoryMapper.toInventoryResponse(inventory, car);
    }

    @Override
    @Transactional
    public void deduceStock(List<Map<String, Object>> items) {
        for (Map<String, Object> item : items) {
            String carId = (String) item.get("carId");
            Integer quantity = (Integer) item.get("quantity");

            log.info("Đang trừ kho cho CarId: {} với số lượng: {}", carId, quantity);

            int currentStock = inventoryRepository.findQuantityByCarId(carId)
                    .orElseThrow(() -> new AppException(ErrorCode.INVENTORY_IS_EMPTY));

            if (currentStock < quantity) {
                throw new AppException(ErrorCode.QUANTITY_NOT_ENOUGH);
            }

            inventoryRepository.reduceStock(carId, quantity);
        }
    }

    @Override
    @Transactional
    public void restoreInventory(List<Map<String, Object>> items) {
        for (Map<String, Object> item : items) {
            String carId = String.valueOf(item.get("carId"));
            Integer quantity = Integer.valueOf(item.get("quantity").toString());

            log.info("Khôi phục kho cho CarId: {} số lượng: {}", carId, quantity);

            Inventory inventory = inventoryRepository.findInventoryByCarId(carId)
                    .orElseThrow(() -> new AppException(ErrorCode.INVENTORY_NOT_FOUND));

            inventory.setQuantity(inventory.getQuantity() + quantity);
            inventoryRepository.save(inventory);
        }
    }

    @Override
    public PageResponse<InventoryResponse> getList(int page, int size) {
        // Sắp xếp theo ngày cập nhật mới nhất
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by("updatedAt").descending());

        Page<Inventory> inventoryPage = inventoryRepository.findAll(pageable);

        // Gom tất cả carId trong Page hiện tại
        List<String> carIds = inventoryPage.getContent().stream()
                .map(Inventory::getCarId)
                .collect(Collectors.toList());

        // Lấy Map Car để truy xuất nhanh, tránh N+1 Query
        Map<String, Car> carMap = carRepository.findAllById(carIds).stream()
                .collect(Collectors.toMap(Car::getId, c -> c));

        List<InventoryResponse> responses = inventoryPage.getContent().stream()
                .map(inventory -> {
                    Car car = carMap.get(inventory.getCarId());
                    // Lưu ý: Nếu Car bị xóa khỏi DB, car có thể null
                    return inventoryMapper.toInventoryResponse(inventory, car);
                })
                .collect(Collectors.toList());

        return PageResponse.<InventoryResponse>builder()
                .currentPage(page)
                .pageSize(size)
                .totalPages(inventoryPage.getTotalPages())
                .totalElements(inventoryPage.getTotalElements())
                .data(responses)
                .build();
    }

    // Các hàm này sẽ dùng khi Quí tích hợp với luồng Payment/Order
    @Override public void updateInventoryAfterPay(String orderId) { }
    @Override public void restoreInventory(String orderId) { }
}