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

import java.util.Collections;
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
            int quantity = (Integer) item.get("quantity");

            int rowsUpdated = inventoryRepository.deduceStock(carId, quantity);
            if (rowsUpdated == 0) {
                log.error("Không đủ số lượng trong kho hoặc không tìm thấy xe. CarId: {}", carId);
                throw new AppException(ErrorCode.QUANTITY_NOT_ENOUGH);
            }
            log.info("Đã trừ {} xe {} từ kho", quantity, carId);
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
        // 1. Phân trang và sắp xếp
        Pageable pageable = PageRequest.of(page - 1, size,
                Sort.by("updatedAt").descending());
        Page<Inventory> inventoryPage = inventoryRepository.findAll(pageable);

        // 2. Early Exit: Nếu trang không có dữ liệu, trả về Page rỗng ngay
        if (inventoryPage.isEmpty()) {
            return PageResponse.<InventoryResponse>builder()
                    .currentPage(page)
                    .pageSize(size)
                    .totalPages(inventoryPage.getTotalPages())
                    .totalElements(inventoryPage.getTotalElements())
                    .data(Collections.emptyList())
                    .build();
        }

        // 3. Gom carId để query 1 lần
        List<String> carIds = inventoryPage.getContent().stream()
                .map(Inventory::getCarId)
                // Có thể thêm .distinct() nếu 1 trang có nhiều dòng tồn kho của cùng 1 xe
                .distinct()
                .collect(Collectors.toList());

        // 4. Lấy Map Car
        Map<String, Car> carMap = carRepository.findAllById(carIds).stream()
                .collect(Collectors.toMap(Car::getId, c -> c));

        // 5. Mapping sang DTO
        List<InventoryResponse> responses = inventoryPage.getContent().stream()
                .map(inventory -> {
                    Car car = carMap.get(inventory.getCarId());

                    // Xử lý an toàn nếu Car bị xóa mềm hoặc mất đồng bộ dữ liệu
                    if (car == null) {
                        throw new AppException(ErrorCode.CAR_NOT_FOUND);
                    }

                    return inventoryMapper.toInventoryResponse(inventory, car);
                })
                .collect(Collectors.toList());

        // 6. Build response
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