package com.tlaq.main_service.services.impl;

import com.tlaq.main_service.dto.PageResponse;
import com.tlaq.main_service.dto.requests.OrdersRequest;
import com.tlaq.main_service.dto.responses.OrderDetailsResponse;
import com.tlaq.main_service.dto.responses.OrderHistoryResponse;
import com.tlaq.main_service.dto.responses.OrderPaymentResponse;
import com.tlaq.main_service.dto.responses.OrdersResponse;
import com.tlaq.main_service.dto.responses.carResponse.CarResponse;
import com.tlaq.main_service.entity.Inventory;
import com.tlaq.main_service.entity.OrderDetails;
import com.tlaq.main_service.entity.Orders;
import com.tlaq.main_service.entity.Profile;
import com.tlaq.main_service.entity.enums.PaymentStatus;
import com.tlaq.main_service.exceptions.AppException;
import com.tlaq.main_service.exceptions.ErrorCode;
import com.tlaq.main_service.mapper.OrdersMapper;
import com.tlaq.main_service.repositories.InventoryRepository;
import com.tlaq.main_service.repositories.OrdersRepository;
import com.tlaq.main_service.repositories.ProfileRepository;
import com.tlaq.main_service.repositories.httpClient.PaymentClient;
import com.tlaq.main_service.services.OrdersService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.AbstractMap;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Service
public class OrdersServiceImpl implements OrdersService {
    OrdersMapper ordersMapper;
    OrdersRepository ordersRepository;
    InventoryRepository inventoryRepository;
    ProfileRepository profileRepository;
    PaymentClient paymentClient;

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
    public List<OrderHistoryResponse> getOrdersResponseByProfileIdAndStatus(String userKeyCloakId) {
        Profile profile = profileRepository.findByUserKeyCloakId(userKeyCloakId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        List<Orders> listOrderProfileIdAndStatusPending = ordersRepository
                .findByProfileIdAndPaymentStatus(profile.getId(), PaymentStatus.PENDING);

        List<OrderPaymentResponse> orderPaymentResponses = paymentClient.orderPayment().getResult();

        Map<String, OrderPaymentResponse> paymentMap = orderPaymentResponses.stream()
                .collect(Collectors.toMap(OrderPaymentResponse::getOrderId, Function.identity()));

        return listOrderProfileIdAndStatusPending.stream()
            .map(order -> {
                OrderPaymentResponse payment = paymentMap.get(order.getId());
                return new AbstractMap.SimpleEntry<>(order, payment);
            })
            .filter(entry -> entry.getValue() != null) // chỉ lấy những order có payment
            .map(entry -> {
                Orders order = entry.getKey();
                OrderPaymentResponse payment = entry.getValue();

                return OrderHistoryResponse.builder()
                        .orderId(order.getId())
                        .fullName(order.getOrderDetails().getFullName())
                        .address(order.getOrderDetails().getAddress())
                        .quantity(order.getOrderDetails().getQuantity())
                        .paymentStatus(order.getPaymentStatus())
                        .username(payment.getProfileId())
                        .totalAmount(payment.getPrice())
                        .disposableAmount(payment.getDisposableAmount())
                        .remainAmount(payment.getRemainAmount())
                        .transactionId(payment.getTransactionId())
                        .createdAt(payment.getCreatedAt())
                        .build();
            })
            .collect(Collectors.toList());
    }

    @Override
    public List<OrderDetailsResponse> getHistoryResponseByProfileId(String userKeyCloakId) {
        Profile profile= profileRepository.findByUserKeyCloakId(userKeyCloakId)
                .orElseThrow(()-> new AppException(ErrorCode.USER_NOT_EXISTED));

        List<Orders> listOrderProfileIdAndStatusPending= ordersRepository
                .findByProfileId(profile.getId());

        List<OrderDetailsResponse> orderDetailsResponses= new ArrayList<>();

        for(Orders orders: listOrderProfileIdAndStatusPending){
            OrderDetailsResponse res = new OrderDetailsResponse();
            res.setOrderId(orders.getId());
            res.setTotalAmount(orders.getOrderDetails().getTotalAmount());
            res.setFullName(orders.getOrderDetails().getFullName());
            res.setAddress(orders.getOrderDetails().getAddress());
            res.setPaymentStatus(orders.getPaymentStatus());
            res.setQuantity(orders.getOrderDetails().getQuantity());
            orderDetailsResponses.add(res);
        }
        return orderDetailsResponses;
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
