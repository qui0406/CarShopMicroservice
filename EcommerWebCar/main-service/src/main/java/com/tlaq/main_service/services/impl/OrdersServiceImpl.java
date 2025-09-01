package com.tlaq.main_service.services.impl;

import com.tlaq.main_service.dto.PageResponse;
import com.tlaq.main_service.dto.requests.OrdersRequest;
import com.tlaq.main_service.dto.responses.OrdersResponse;
import com.tlaq.main_service.dto.responses.carResponse.CarResponse;
import com.tlaq.main_service.entity.Inventory;
import com.tlaq.main_service.entity.Orders;
import com.tlaq.main_service.entity.Profile;
import com.tlaq.main_service.entity.enums.PaymentStatus;
import com.tlaq.main_service.exceptions.AppException;
import com.tlaq.main_service.exceptions.ErrorCode;
import com.tlaq.main_service.mapper.OrdersMapper;
import com.tlaq.main_service.repositories.InventoryRepository;
import com.tlaq.main_service.repositories.OrdersRepository;
import com.tlaq.main_service.repositories.ProfileRepository;
import com.tlaq.main_service.services.OrdersService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Service
public class OrdersServiceImpl implements OrdersService {
    OrdersMapper ordersMapper;
    OrdersRepository ordersRepository;
    InventoryRepository inventoryRepository;
    ProfileRepository profileRepository;

    @Override
    public OrdersResponse getOrders(String id) {
        Orders orders = ordersRepository.findById(id)
                .orElseThrow(()-> new AppException(ErrorCode.ORDER_IS_EMPTY));
        return ordersMapper.toOrdersResponse(orders);
    }

    @Override
    public OrdersResponse createOrder(OrdersRequest request, String userKeyCloakId) {
        if (!inventoryRepository.existsByCarId(request.getCarId())) {
            throw new AppException(ErrorCode.INVENTORY_IS_EMPTY);
        }

        if (!inventoryRepository.existsByCarIdAndQuantityGreaterThanEqual(request.getCarId(), request.getQuantity())) {
            throw new AppException(ErrorCode.QUANTITY_NOT_ENOUGH);
        }

        Profile profile= profileRepository.findByUserKeyCloakId(userKeyCloakId)
                .orElseThrow(()-> new AppException(ErrorCode.USER_NOT_EXISTED));


        Orders orders = ordersMapper.toOrdersEntity(request);
        orders.setProfile(profile);
        Orders save = ordersRepository.save(orders);

        return ordersMapper.toOrdersResponse(save);
    }

    public void markSuccess(String id) { updateStatus(id, PaymentStatus.SUCCESS); }
    public void markFail(String id)    { updateStatus(id, PaymentStatus.FAIL); }

    private void updateStatus(String id, PaymentStatus s) {
        ordersRepository.findById(id).ifPresent(o -> { o.setPaymentStatus(s); ordersRepository.save(o); });
    }


    @Override
    public List<OrdersResponse> getOrdersResponseByProfileIdAndStatus(String userKeyCloakId) {
        Profile profile= profileRepository.findByUserKeyCloakId(userKeyCloakId)
                .orElseThrow(()-> new AppException(ErrorCode.USER_NOT_EXISTED));

        List<Orders> listOrderProfileIdAndStatusPending= ordersRepository
                .findByProfileIdAndPaymentStatus(profile.getId(), PaymentStatus.PENDING);

        return ordersMapper.toOrdersResponseList(listOrderProfileIdAndStatusPending);
    }

    @Override
    public List<OrdersResponse> getHistoryResponseByProfileId(String userKeyCloakId) {
        Profile profile= profileRepository.findByUserKeyCloakId(userKeyCloakId)
                .orElseThrow(()-> new AppException(ErrorCode.USER_NOT_EXISTED));

        List<Orders> listOrderProfileIdAndStatusPending= ordersRepository
                .findByProfileId(profile.getId());
        return ordersMapper.toOrdersResponseList(listOrderProfileIdAndStatusPending);
    }

    @Override
    public PageResponse<OrdersResponse> getAll(int page, int size) {
        Sort sort= Sort.by(Sort.Direction.DESC, "createdAt");
        Pageable pageable= PageRequest.of(page- 1, size, sort);
        var pageData = ordersRepository.findAll(pageable);

        return PageResponse.<OrdersResponse>builder()
                .currentPage(page)
                .pageSize(pageData.getSize())
                .totalPages(pageData.getTotalPages())
                .totalElements(pageData.getTotalElements())
                .data(pageData.getContent().stream().map(ordersMapper::toOrdersResponse).toList())
                .build();
    }
}
