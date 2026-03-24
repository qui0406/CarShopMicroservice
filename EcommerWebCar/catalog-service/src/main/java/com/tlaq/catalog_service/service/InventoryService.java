package com.tlaq.catalog_service.service;

import com.tlaq.catalog_service.dto.request.InventoryRequest;
import com.tlaq.catalog_service.dto.request.InventoryUpdateRequest;
import com.tlaq.catalog_service.dto.response.InventoryResponse;

import java.util.List;
import java.util.Map;

public interface InventoryService {
    InventoryResponse get(String inventoryId);
    InventoryResponse create(InventoryRequest request);
    InventoryResponse update(InventoryUpdateRequest request, String inventoryId);
    void delete(String inventoryId);
    void updateInventoryAfterPay(String orderId);
    void restoreInventory(String orderId);
    InventoryResponse getInventoryByCarId(String carId);
    Boolean checkStock(String carId, Integer quantity);
    void deduceStock(List<Map<String, Object>> items);
    void restoreInventory(List<Map<String, Object>> items);
}
