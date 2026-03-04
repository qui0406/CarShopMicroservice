package com.tlaq.ordering_service.mapper;

import com.tlaq.ordering_service.dto.request.OrdersRequest;
import com.tlaq.ordering_service.dto.response.OrdersHistoryResponse;
import com.tlaq.ordering_service.dto.response.OrdersResponse;
import com.tlaq.ordering_service.entity.Orders;
import com.tlaq.ordering_service.entity.OrdersHistory;
import org.mapstruct.DecoratedWith;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OrdersMapper {
    OrdersResponse toOrdersResponse(Orders orders);
    Orders toOrdersEntity(OrdersRequest ordersRequest);

    @Mapping(target = "orderId", source = "order.id")
    OrdersHistoryResponse toOrdersHistoryResponse(OrdersHistory history);
}
