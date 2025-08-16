package com.tlaq.main_service.services.impl;

import com.tlaq.main_service.dto.requests.OrdersRequest;
import com.tlaq.main_service.dto.responses.OrdersResponse;
import com.tlaq.main_service.entity.Inventory;
import com.tlaq.main_service.entity.Orders;
import com.tlaq.main_service.entity.enums.PaymentStatus;
import com.tlaq.main_service.exceptions.AppException;
import com.tlaq.main_service.exceptions.ErrorCode;
import com.tlaq.main_service.mapper.OrdersMapper;
import com.tlaq.main_service.repositories.InventoryRepository;
import com.tlaq.main_service.repositories.OrdersRepository;
import com.tlaq.main_service.services.OrdersService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Service
public class OrdersServiceImpl implements OrdersService {
    OrdersMapper ordersMapper;
    OrdersRepository ordersRepository;
    InventoryRepository inventoryRepository;

    @Override
    public OrdersResponse getOrders(String id) {
        Orders orders = ordersRepository.findById(id)
                .orElseThrow(()-> new AppException(ErrorCode.ORDER_IS_EMPTY));
        return ordersMapper.toOrdersResponse(orders);
    }

    @Override
    public OrdersResponse createOrder(OrdersRequest request) {
        if (!inventoryRepository.existsByCarId(request.getCarId())) {
            throw new AppException(ErrorCode.INVENTORY_IS_EMPTY);
        }

        if (!inventoryRepository.existsByCarIdAndQuantityGreaterThanEqual(request.getCarId(), request.getQuantity())) {
            throw new AppException(ErrorCode.QUANTITY_NOT_ENOUGH);
        }

        Orders orders = ordersMapper.toOrdersEntity(request);
        Orders save = ordersRepository.save(orders);

        return ordersMapper.toOrdersResponse(save);
    }

    public void markSuccess(String id) { updateStatus(id, PaymentStatus.SUCCESS); }
    public void markFail(String id)    { updateStatus(id, PaymentStatus.FAIL); }

    private void updateStatus(String id, PaymentStatus s) {
        ordersRepository.findById(id).ifPresent(o -> { o.setPaymentStatus(s); ordersRepository.save(o); });
    }
}
