package com.tlaq.ordering_service.mapper;

import com.tlaq.ordering_service.dto.request.OrdersRequest;
import com.tlaq.ordering_service.dto.response.OrdersDetailsResponse;
import com.tlaq.ordering_service.dto.response.OrdersHistoryResponse;
import com.tlaq.ordering_service.dto.response.OrdersResponse;
import com.tlaq.ordering_service.entity.Orders;
import com.tlaq.ordering_service.entity.OrdersDetails;
import com.tlaq.ordering_service.entity.OrdersHistory;
import org.mapstruct.DecoratedWith;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface OrdersMapper {
    @Mapping(target = "id",              ignore = true)
    @Mapping(target = "userId",          ignore = true) // set từ Keycloak
    @Mapping(target = "status",          ignore = true) // set = PENDING
    @Mapping(target = "type",            ignore = true) // set theo role
    @Mapping(target = "baseAmount",      ignore = true) // tính trong service
    @Mapping(target = "taxAmount",       ignore = true)
    @Mapping(target = "plateFeeAmount",  ignore = true)
    @Mapping(target = "insuranceAmount", ignore = true)
    @Mapping(target = "totalAmount",     ignore = true)
    @Mapping(target = "orderItem",       ignore = true) // build thủ công trong service
    @Mapping(target = "createdAt",       ignore = true)
    @Mapping(target = "updatedAt",       ignore = true)
    Orders toOrdersEntity(OrdersRequest request);

    @Mapping(target = "orderItem", source = "orderItem")
    @Mapping(target = "depositAmount", ignore = true)
    OrdersResponse toOrdersResponse(Orders orders);

    List<OrdersResponse> toOrdersResponseList(List<Orders> orders);

    @Mapping(target = "totalAmount", ignore = true)
    OrdersDetailsResponse toOrdersDetailsResponse(OrdersDetails details);

    List<OrdersDetailsResponse> toOrdersDetailsResponseList(List<OrdersDetails> details);

    @Mapping(target = "orderId", source = "order.id")
    OrdersHistoryResponse toOrdersHistoryResponse(OrdersHistory history);

}
