package com.tlaq.main_service.services;

import com.tlaq.main_service.dto.requests.inventoryRequest.InventoryRequest;
import com.tlaq.main_service.dto.requests.inventoryRequest.InventoryUpdateRequest;
import com.tlaq.main_service.dto.responses.InventoryResponse;

import java.util.List;
import java.util.UUID;

public interface InventoryService {
    InventoryResponse getInventory(String inventoryId);
    InventoryResponse createInventory(InventoryRequest request);
    InventoryResponse updateInventory(InventoryUpdateRequest request, String inventoryId);
    void deleteInventory(String inventoryId);

    void updateInventoryAfterPay(String orderId);
}
