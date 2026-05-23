package com.tlaq.catalog_service.service;

import com.tlaq.catalog_service.dto.PageResponse;
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
    void markAsSold(List<Map<String, Object>> items);
    PageResponse<InventoryResponse> getList(int page, int size);

    /**
     * Giữ chỗ xe ngay lập tức (đồng bộ) khi người dùng xác nhận đơn hàng.
     * @return true nếu giữ chỗ thành công, false nếu xe đã bị đặt/bán/chưa sẵn sàng.
     */
    boolean reserveCar(String carId);

    /**
     * Hủy giữ chỗ xe (đồng bộ) khi đơn hàng bị hủy hoặc hết hạn.
     * @return true nếu hủy thành công, false nếu xe chưa được giữ chỗ.
     */
    boolean unreserveCar(String carId);
}
