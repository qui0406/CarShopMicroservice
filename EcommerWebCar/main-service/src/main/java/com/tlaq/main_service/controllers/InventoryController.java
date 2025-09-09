package com.tlaq.main_service.controllers;

import com.tlaq.main_service.dto.ApiResponse;
import com.tlaq.main_service.dto.requests.inventoryRequest.InventoryRequest;
import com.tlaq.main_service.dto.requests.inventoryRequest.InventoryUpdateRequest;
import com.tlaq.main_service.dto.responses.InventoryResponse;
import com.tlaq.main_service.services.InventoryService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class InventoryController {
    InventoryService inventoryService;

    @GetMapping("/inventory/get-inventory/{inventoryId}")
    public ApiResponse<InventoryResponse> getInventory(@PathVariable String inventoryId) {
        return ApiResponse.<InventoryResponse>builder()
                .result(inventoryService.getInventory(inventoryId))
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
                .result(inventoryService.createInventory(inventoryRequest))
                .build();
    }

    @PutMapping("/staff/inventory/update-inventory/{inventoryId}")
    public ApiResponse<InventoryResponse> updateInventory(@PathVariable String inventoryId,
                                                          @RequestBody InventoryUpdateRequest request) {
        return ApiResponse.<InventoryResponse>builder()
                .result(inventoryService.updateInventory(request, inventoryId))
                .build();
    }

    @DeleteMapping("/staff/inventory/delete-inventory/{inventoryId}")
    public ApiResponse<InventoryResponse> deleteInventory(@PathVariable String inventoryId) {
        inventoryService.deleteInventory(inventoryId);
        return ApiResponse.<InventoryResponse>builder()
                .message("Inventory deleted successfully")
                .build();
    }

}
