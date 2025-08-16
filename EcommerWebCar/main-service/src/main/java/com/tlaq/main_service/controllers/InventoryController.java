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
@RequestMapping("/inventory")
public class InventoryController {
    InventoryService inventoryService;

    @GetMapping("/get-inventory/{inventoryId}")
    public ApiResponse<InventoryResponse> getInventory(@PathVariable String inventoryId) {
        return ApiResponse.<InventoryResponse>builder()
                .result(inventoryService.getInventory(inventoryId))
                .build();
    }

    @PostMapping("/create-inventory")
    public ApiResponse<InventoryResponse> createInventory(@RequestBody InventoryRequest inventoryRequest) {
        return ApiResponse.<InventoryResponse>builder()
                .result(inventoryService.createInventory(inventoryRequest))
                .build();
    }

    @PutMapping("/update-inventory/{inventoryId}")
    public ApiResponse<InventoryResponse> updateInventory(@PathVariable String inventoryId,
                                                          @RequestBody InventoryUpdateRequest request) {
        return ApiResponse.<InventoryResponse>builder()
                .result(inventoryService.updateInventory(request, inventoryId))
                .build();
    }

    @DeleteMapping("/delete-inventory/{inventoryId}")
    public ApiResponse<InventoryResponse> deleteInventory(@PathVariable String inventoryId) {
        inventoryService.deleteInventory(inventoryId);
        return ApiResponse.<InventoryResponse>builder()
                .message("Inventory deleted successfully")
                .build();
    }

}
