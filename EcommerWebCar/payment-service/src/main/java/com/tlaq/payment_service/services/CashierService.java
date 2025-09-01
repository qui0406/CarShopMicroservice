package com.tlaq.payment_service.services;

import com.tlaq.payment_service.dto.event.ResVNPayEvent;
import com.tlaq.payment_service.dto.request.CashPaymentRequest;
import com.tlaq.payment_service.dto.response.CashPaymentResponse;
import com.tlaq.payment_service.dto.response.OrdersResponse;
import com.tlaq.payment_service.dto.response.Profile;
import com.tlaq.payment_service.dto.response.UserProfileResponse;
import com.tlaq.payment_service.entity.CashierPayment;
import com.tlaq.payment_service.entity.enums.PaymentMethod;
import com.tlaq.payment_service.entity.enums.PaymentStatus;
import com.tlaq.payment_service.exceptions.AppException;
import com.tlaq.payment_service.exceptions.ErrorCode;
import com.tlaq.payment_service.message.PaymentStatusProducer;
import com.tlaq.payment_service.repository.CashPaymentRepository;
import com.tlaq.payment_service.repository.PaymentRepository;
import com.tlaq.payment_service.repository.httpClient.MainClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class CashierService {
    @Autowired
    MainClient mainClient;

    @Autowired
    CashPaymentRepository cashPaymentRepository;

    @Autowired
    PaymentRepository paymentRepository;

    @Autowired
    PaymentStatusProducer paymentStatusProducer;

    public CashPaymentResponse getBill(String id) {
        CashierPayment cashierPayment = cashPaymentRepository.findById(id)
                .orElseThrow(()-> new AppException(ErrorCode.BILL_NOT_FOUND));
        return toCashPaymentResponse(cashierPayment);
    }

    public CashPaymentResponse create(CashPaymentRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userKeyCloakId = authentication.getName();
        UserProfileResponse staff = mainClient.getProfile(userKeyCloakId).getResult();

        OrdersResponse ordersResponse = mainClient.getOrder(request.getOrderId()).getResult();
        if(paymentRepository.existsByOrderId(request.getOrderId())) {
            if(paymentRepository.getPaymentStatusByOrderId(request.getOrderId()).equals(PaymentStatus.SUCCESS)) {
                throw new AppException(ErrorCode.ORDER_WAS_PAYMENT);
            }
        }

        CashierPayment cashierPayment = CashierPayment.builder()
                .orderId(request.getOrderId())
                .profileId(ordersResponse.getProfile().getId())
                .paymentMethod(PaymentMethod.CASHIER_TRANSFER)
                .staffId(staff.getId())
                .price(ordersResponse.getOrderDetails().getTotalAmount())
                .status(PaymentStatus.SUCCESS)
                .build();
            cashPaymentRepository.save(cashierPayment);

        ResVNPayEvent resVNPayEvent = ResVNPayEvent.builder()
                .code("00")
                .message("Successful")
                .orderId(request.getOrderId())
                .build();
        paymentStatusProducer.sendStatusCodeVNPay(resVNPayEvent);
        return toCashPaymentResponse(cashierPayment);
    }



    private CashPaymentResponse toCashPaymentResponse(CashierPayment cashierPayment) {
        UserProfileResponse client = mainClient.getProfileById(cashierPayment.getProfileId()).getResult();

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userKeyCloakId = authentication.getName();
        UserProfileResponse staff = mainClient.getProfile(userKeyCloakId).getResult();

        return CashPaymentResponse.builder()
                .id(cashierPayment.getId())
                .orderId(cashierPayment.getOrderId())
                .price(cashierPayment.getPrice())
                .paymentMethod(cashierPayment.getPaymentMethod())
                .status(cashierPayment.getStatus())
                .createdAt(cashierPayment.getCreatedAt())
                .profileId(Profile.builder()
                        .id(client.getId())
                        .username(client.getUsername())
                        .firstName(client.getFirstName())
                        .lastName(client.getLastName())
                        .email(client.getEmail())
                        .dob(client.getDob())
                        .build())
                .staffId(Profile.builder()
                        .id(staff.getId())
                        .firstName(staff.getFirstName())
                        .lastName(staff.getLastName())
                        .email(staff.getEmail())
                        .dob(staff.getDob())
                        .username(client.getUsername())
                        .build())
                .build();
    }

}
