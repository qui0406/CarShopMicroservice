package com.tlaq.main_service.mapper.decorator;

import com.tlaq.main_service.dto.requests.orderRequest.OrdersRequest;
import com.tlaq.main_service.dto.responses.OrderDetailsResponse;
import com.tlaq.main_service.dto.responses.OrdersResponse;
import com.tlaq.main_service.entity.OrderDetails;
import com.tlaq.main_service.entity.Orders;
import com.tlaq.main_service.entity.enums.PaymentStatus;
import com.tlaq.main_service.exceptions.AppException;
import com.tlaq.main_service.exceptions.ErrorCode;
import com.tlaq.main_service.mapper.OrdersMapper;
import com.tlaq.main_service.repositories.CarRepository;
import com.tlaq.main_service.repositories.OrdersRepository;
import com.tlaq.main_service.repositories.ProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public abstract class OrderMapperDecorator implements OrdersMapper {
    @Autowired
    @Qualifier("delegate")
    private OrdersMapper delegate;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private CarRepository carRepository;

    @Autowired
    private OrdersRepository ordersRepository;

    @Override
    public OrdersResponse toOrdersResponse(Orders orders) {
        return OrdersResponse.builder()
                .id(orders.getId())
                .paymentStatus(PaymentStatus.PENDING)
                .roleCreateOrder(orders.getRoleCreateOrder())
                .orderDetails(OrderDetailsResponse.builder()
                        .orderId(orders.getId())
                        .username(orders.getProfile().getUsername())
                        .totalAmount(orders.getOrderDetails().getTotalAmount())
                        .address(orders.getOrderDetails().getAddress())
                        .fullName(orders.getOrderDetails().getFullName())
                        .quantity(orders.getOrderDetails().getQuantity())
                        .phone(orders.getOrderDetails().getPhoneNumber())
                        .dob(orders.getOrderDetails().getDob())
                        .cccd(orders.getOrderDetails().getCccd())
                        .build())
                .profile(OrdersResponse.ProfileResponse.builder()
                        .id(orders.getProfile().getId())
                        .username(orders.getProfile().getUsername())
                        .address(orders.getProfile().getAddress())
                        .phone(orders.getProfile().getPhone())
                        .build())
                .build();
    }


    @Override
    public Orders toOrdersEntity(OrdersRequest request) {
        return Orders.builder()
            .id(request.getId())
            .paymentStatus(PaymentStatus.PENDING)
            .car(carRepository.findById(request.getCarId())
                    .orElseThrow(()-> new AppException(ErrorCode.CAR_NOT_FOUND)))
            .orderDetails(OrderDetails.builder()
                    .fullName(request.getOrderDetailsRequest().getFullName())
                    .dob(request.getOrderDetailsRequest().getDob())
                    .cccd(request.getOrderDetailsRequest().getCccd())
                    .phoneNumber(request.getOrderDetailsRequest().getPhoneNumber())
                    .address(request.getOrderDetailsRequest().getAddress())
                    .unitPrice(request.getUnitPrice())
                    .quantity(request.getQuantity())
                    .totalAmount(request.getUnitPrice().multiply(new BigDecimal(request.getQuantity())))
                    .build())
            .build();
    }
}
