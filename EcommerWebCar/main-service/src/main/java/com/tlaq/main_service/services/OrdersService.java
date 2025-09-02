package com.tlaq.main_service.services;

import com.tlaq.main_service.dto.PageResponse;
import com.tlaq.main_service.dto.requests.OrdersRequest;
import com.tlaq.main_service.dto.responses.OrderDetailsResponse;
import com.tlaq.main_service.dto.responses.OrderHistoryResponse;
import com.tlaq.main_service.dto.responses.OrdersResponse;

import java.util.List;

public interface OrdersService {
    OrdersResponse getOrders(String id);
    OrdersResponse createOrder(OrdersRequest request, String userKeyCloakId);
    void markSuccess(String id);
    void markFail(String id);

    List<OrderHistoryResponse> getOrdersResponseByProfileIdAndStatus(String useKeyCloakId);
    List<OrderDetailsResponse> getHistoryResponseByProfileId(String useKeyCloakId);

    PageResponse<OrdersResponse> getAll(int page, int size);
}
