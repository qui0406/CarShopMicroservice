package com.tlaq.main_service.mapper.decorator;

import com.tlaq.main_service.dto.requests.OrdersRequest;
import com.tlaq.main_service.dto.responses.OrdersResponse;
import com.tlaq.main_service.entity.OrderDetails;
import com.tlaq.main_service.entity.Orders;
import com.tlaq.main_service.entity.Profile;
import com.tlaq.main_service.entity.enums.PaymentStatus;
import com.tlaq.main_service.exceptions.AppException;
import com.tlaq.main_service.exceptions.ErrorCode;
import com.tlaq.main_service.mapper.NewsMapper;
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


    @Override
    public Orders toOrdersEntity(OrdersRequest request) {
        return Orders.builder()
            .id(request.getId())
            .paymentStatus(PaymentStatus.PENDING)
            .car(carRepository.findById(request.getCarId())
                    .orElseThrow(()-> new AppException(ErrorCode.CAR_NOT_FOUND)))
            .profile(profileRepository.findById(request.getProfileId())
                    .orElseThrow(()-> new AppException(ErrorCode.USER_NOT_EXISTED)))
            .orderDetails(OrderDetails.builder()
                    .unitPrice(request.getUnitPrice())
                    .quantity(request.getQuantity())
                    .totalAmount(request.getUnitPrice().multiply(new BigDecimal(request.getQuantity())))
                    .build())
            .build();
    }
}
