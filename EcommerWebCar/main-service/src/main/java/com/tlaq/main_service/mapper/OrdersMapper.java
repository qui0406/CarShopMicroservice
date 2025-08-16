package com.tlaq.main_service.mapper;

import com.tlaq.main_service.dto.requests.OrdersRequest;
import com.tlaq.main_service.dto.responses.OrdersResponse;
import com.tlaq.main_service.entity.Orders;
import com.tlaq.main_service.mapper.decorator.OrderMapperDecorator;
import org.mapstruct.DecoratedWith;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
@DecoratedWith(OrderMapperDecorator.class)
public interface OrdersMapper {
    OrdersResponse toOrdersResponse(Orders orders);

    Orders toOrdersEntity(OrdersRequest ordersRequest);
}
