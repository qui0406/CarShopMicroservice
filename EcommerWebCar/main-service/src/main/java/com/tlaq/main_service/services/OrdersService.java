package com.tlaq.main_service.services;

import com.tlaq.main_service.dto.requests.OrdersRequest;
import com.tlaq.main_service.dto.responses.OrdersResponse;

public interface OrdersService {
    OrdersResponse getOrders(String id);
    OrdersResponse createOrder(OrdersRequest request);
    void markSuccess(String id);
    void markFail(String id);
}
