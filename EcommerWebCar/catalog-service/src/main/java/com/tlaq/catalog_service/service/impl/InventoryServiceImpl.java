package com.tlaq.catalog_service.service.impl;

import com.tlaq.catalog_service.dto.PageResponse;
import com.tlaq.catalog_service.dto.request.InventoryRequest;
import com.tlaq.catalog_service.dto.request.InventoryUpdateRequest;
import com.tlaq.catalog_service.dto.response.InventoryResponse;
import com.tlaq.catalog_service.entity.Car;
import com.tlaq.catalog_service.entity.ShowRoom;
import com.tlaq.catalog_service.exceptions.AppException;
import com.tlaq.catalog_service.exceptions.ErrorCode;
import com.tlaq.catalog_service.mapper.InventoryMapper;
import com.tlaq.catalog_service.repo.CarRepository;
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
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Service
@org.springframework.context.annotation.Primary
public class InventoryServiceImpl implements InventoryService {
    InventoryMapper inventoryMapper;
    CarRepository carRepository;
    ShowRoomRepository showRoomRepository;

    @Override
    public InventoryResponse get(String inventoryId) {
        Car car = carRepository.findById(inventoryId)
                .orElseThrow(() -> new AppException(ErrorCode.CAR_NOT_FOUND));

        return inventoryMapper.toInventoryResponse(car);
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

        // 3. Set Showroom and status
        car.setShowRoom(showRoom);
        car.setReady(request.getQuantity() > 0);

        Car savedCar = carRepository.save(car);
        return inventoryMapper.toInventoryResponse(savedCar);
    }

    @Override
    public Boolean checkStock(String carId, Integer quantity) {
        return carRepository.findById(carId)
                .map(car -> car.isReady() && !car.isDeleted() && !car.isDeposited() && !car.isSold() && quantity == 1)
                .orElse(false);
    }

    @Override
    @Transactional
    public InventoryResponse update(InventoryUpdateRequest request, String inventoryId) {
        Car car = carRepository.findById(inventoryId)
                .orElseThrow(() -> new AppException(ErrorCode.CAR_NOT_FOUND));

        if (request.getQuantity() < 0) {
            throw new AppException(ErrorCode.INVALID_QUANTITY);
        }

        car.setReady(request.getQuantity() > 0);
        Car savedCar = carRepository.save(car);

        return inventoryMapper.toInventoryResponse(savedCar);
    }

    @Override
    @Transactional
    public void delete(String inventoryId) {
        Car car = carRepository.findById(inventoryId)
                .orElseThrow(() -> new AppException(ErrorCode.CAR_NOT_FOUND));
        car.setReady(false);
        carRepository.save(car);
    }

    @Override
    public InventoryResponse getInventoryByCarId(String carId) {
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new AppException(ErrorCode.CAR_NOT_FOUND));

        return inventoryMapper.toInventoryResponse(car);
    }

    @Override
    @Transactional
    public void deduceStock(List<Map<String, Object>> items) {
        for (Map<String, Object> item : items) {
            String carId = (String) item.get("carId");

            int rowsUpdated = carRepository.markAsDeposited(carId);
            if (rowsUpdated == 0) {
                log.error("Không thể đánh dấu xe đặt cọc. Xe không tồn tại, đã bị đặt, đã bán, hoặc chưa sẵn sàng. CarId: {}", carId);
                throw new AppException(ErrorCode.QUANTITY_NOT_ENOUGH);
            }
            log.info("Đã đánh dấu xe {} đang đặt cọc (isDeposited = true)", carId);
        }
    }

    @Override
    @Transactional
    public void restoreInventory(List<Map<String, Object>> items) {
        for (Map<String, Object> item : items) {
            String carId = String.valueOf(item.get("carId"));

            log.info("Hoàn trạng thái đặt cọc cho CarId: {}", carId);

            int rowsUpdated = carRepository.unmarkDeposited(carId);
            if (rowsUpdated == 0) {
                log.warn("Không thể hoàn trạng thái đặt cọc (có thể xe chưa được đặt cọc). CarId: {}", carId);
            } else {
                log.info("Đã hoàn trạng thái xe {} về có thể bán (isDeposited = false)", carId);
            }
        }
    }

    @Override
    @Transactional
    public void markAsSold(List<Map<String, Object>> items) {
        for (Map<String, Object> item : items) {
            String carId = String.valueOf(item.get("carId"));

            int rowsUpdated = carRepository.markAsSold(carId);
            if (rowsUpdated == 0) {
                log.error("Không thể đánh dấu xe đã bán. CarId: {}", carId);
                throw new AppException(ErrorCode.CAR_NOT_FOUND);
            }
            log.info("Đã đánh dấu xe {} là ĐÃ BÁN (isSold = true)", carId);
        }
    }

    @Override
    public PageResponse<InventoryResponse> getList(int page, int size) {
        // 1. Phân trang và sắp xếp
        Pageable pageable = PageRequest.of(page - 1, size,
                Sort.by("updatedAt").descending());
        Page<Car> carPage = carRepository.findAll(pageable);

        // 2. Early Exit: Nếu trang không có dữ liệu, trả về Page rỗng ngay
        if (carPage.isEmpty()) {
            return PageResponse.<InventoryResponse>builder()
                    .currentPage(page)
                    .pageSize(size)
                    .totalPages(carPage.getTotalPages())
                    .totalElements(carPage.getTotalElements())
                    .data(Collections.emptyList())
                    .build();
        }

        // 3. Mapping sang DTO
        List<InventoryResponse> responses = carPage.getContent().stream()
                .map(inventoryMapper::toInventoryResponse)
                .collect(Collectors.toList());

        // 4. Build response
        return PageResponse.<InventoryResponse>builder()
                .currentPage(page)
                .pageSize(size)
                .totalPages(carPage.getTotalPages())
                .totalElements(carPage.getTotalElements())
                .data(responses)
                .build();
    }

    // Các hàm này sẽ dùng khi Quí tích hợp với luồng Payment/Order
    @Override public void updateInventoryAfterPay(String orderId) { }
    @Override public void restoreInventory(String orderId) { }

    @Override
    @Transactional
    public boolean reserveCar(String carId) {
        int rowsUpdated = carRepository.markAsDeposited(carId);
        if (rowsUpdated > 0) {
            log.info("Đã giữ chỗ xe {} ngay lập tức (isDeposited = true)", carId);
            return true;
        }
        log.warn("Không thể giữ chỗ xe {}. Xe đã được đặt cọc, đã bán, hoặc chưa sẵn sàng.", carId);
        return false;
    }

    @Override
    @Transactional
    public boolean unreserveCar(String carId) {
        int rowsUpdated = carRepository.unmarkDeposited(carId);
        if (rowsUpdated > 0) {
            log.info("Đã hủy giữ chỗ xe {} (isDeposited = false)", carId);
            return true;
        }
        log.warn("Không thể hủy giữ chỗ xe {} (có thể xe chưa được giữ chỗ).", carId);
        return false;
    }
}