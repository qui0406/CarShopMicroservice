package com.tlaq.catalog_service.controller;

import com.tlaq.catalog_service.dto.ApiResponse;
import com.tlaq.catalog_service.dto.PageResponse;
import com.tlaq.catalog_service.dto.request.InventoryRequest;
import com.tlaq.catalog_service.dto.request.InventoryUpdateRequest;
import com.tlaq.catalog_service.dto.response.InventoryResponse;
import com.tlaq.catalog_service.service.InventoryService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class InventoryController {
    InventoryService inventoryService;

    @GetMapping("/inventory/get-inventory/{inventoryId}")
    public ApiResponse<InventoryResponse> getInventory(@PathVariable String inventoryId) {
        return ApiResponse.<InventoryResponse>builder()
                .result(inventoryService.get(inventoryId))
                .build();
    }

    @GetMapping("/inventory/get-inventory-by-car-id/{carId}")
    public ApiResponse<InventoryResponse> getInventoryByCarId(@PathVariable String carId) {
        return ApiResponse.<InventoryResponse>builder()
                .result(inventoryService.getInventoryByCarId(carId))
                .build();
    }

    @PreAuthorize("hasRole('STAFF')")
    @GetMapping("/inventory/get-all-inventory")
    public ApiResponse<PageResponse<InventoryResponse>> getAllInventory(
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "size", defaultValue = "12") int size) {
        return ApiResponse.<PageResponse<InventoryResponse>>builder()
                .result(inventoryService.getList(page, size))
                .build();
    }

    @GetMapping("/cars/check-inventory/{carId}/{quantity}")
    public ApiResponse<Boolean> checkStock(
            @PathVariable String carId,
            @PathVariable Integer quantity) { // Dùng @PathVariable [cite: 2026-03-10]
        return ApiResponse.<Boolean>builder()
                .result(inventoryService.checkStock(carId, quantity)) // Gọi xuống service xử lý [cite: 2026-03-10]
                .build();
    }

    @PreAuthorize("hasRole('STAFF')")
    @PostMapping("/staff/inventory/create-inventory")
    public ApiResponse<InventoryResponse> createInventory(@RequestBody InventoryRequest inventoryRequest) {
        return ApiResponse.<InventoryResponse>builder()
                .result(inventoryService.create(inventoryRequest))
                .build();
    }

    @PreAuthorize("hasRole('STAFF')")
    @PutMapping("/staff/inventory/update-inventory/{inventoryId}")
    public ApiResponse<InventoryResponse> updateInventory(@PathVariable String inventoryId,
                                                          @RequestBody InventoryUpdateRequest request) {
        return ApiResponse.<InventoryResponse>builder()
                .result(inventoryService.update(request, inventoryId))
                .build();
    }

    @PreAuthorize("hasRole('STAFF')")
    @DeleteMapping("/staff/inventory/delete-inventory/{inventoryId}")
    public ApiResponse<InventoryResponse> deleteInventory(@PathVariable String inventoryId) {
        inventoryService.delete(inventoryId);
        return ApiResponse.<InventoryResponse>builder()
                .message("Inventory deleted successfully")
                .build();
    }

    /**
     * Giữ chỗ xe ngay lập tức khi người dùng xác nhận đơn hàng.
     * Endpoint này được ordering-service gọi đồng bộ qua Feign để đảm bảo
     * chỉ 1 người có thể đặt cọc 1 chiếc xe tại bất kỳ thời điểm nào.
     */
    @PostMapping("/inventory/reserve/{carId}")
    public ApiResponse<Boolean> reserveCar(@PathVariable String carId) {
        boolean success = inventoryService.reserveCar(carId);
        return ApiResponse.<Boolean>builder()
                .result(success)
                .build();
    }

    /**
     * Hủy giữ chỗ xe khi đơn hàng bị hủy hoặc hết hạn 24h.
     */
    @PostMapping("/inventory/unreserve/{carId}")
    public ApiResponse<Boolean> unreserveCar(@PathVariable String carId) {
        boolean success = inventoryService.unreserveCar(carId);
        return ApiResponse.<Boolean>builder()
                .result(success)
                .build();
    }

}
