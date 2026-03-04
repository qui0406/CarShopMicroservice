package com.tlaq.catalog_service.controller;

import com.tlaq.catalog_service.dto.ApiResponse;
import com.tlaq.catalog_service.dto.request.InventoryRequest;
import com.tlaq.catalog_service.dto.request.InventoryUpdateRequest;
import com.tlaq.catalog_service.dto.response.InventoryResponse;
import com.tlaq.catalog_service.service.InventoryService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

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

    @GetMapping("/inventory/get-inventory-by-carId/{carId}")
    public ApiResponse<InventoryResponse> getInventoryByCarId(@PathVariable String carId) {
        return ApiResponse.<InventoryResponse>builder()
                .result(inventoryService.getInventoryByCarId(carId))
                .build();
    }

    @PostMapping("/staff/inventory/create-inventory")
    public ApiResponse<InventoryResponse> createInventory(@RequestBody InventoryRequest inventoryRequest) {
        return ApiResponse.<InventoryResponse>builder()
                .result(inventoryService.create(inventoryRequest))
                .build();
    }

    @PutMapping("/staff/inventory/update-inventory/{inventoryId}")
    public ApiResponse<InventoryResponse> updateInventory(@PathVariable String inventoryId,
                                                          @RequestBody InventoryUpdateRequest request) {
        return ApiResponse.<InventoryResponse>builder()
                .result(inventoryService.update(request, inventoryId))
                .build();
    }

    @DeleteMapping("/staff/inventory/delete-inventory/{inventoryId}")
    public ApiResponse<InventoryResponse> deleteInventory(@PathVariable String inventoryId) {
        inventoryService.delete(inventoryId);
        return ApiResponse.<InventoryResponse>builder()
                .message("Inventory deleted successfully")
                .build();
    }

}
