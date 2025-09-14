package com.tlaq.payment_service.services;

import com.tlaq.payment_service.dto.event.ResVNPayEvent;
import com.tlaq.payment_service.dto.request.CashPaymentRequest;
import com.tlaq.payment_service.dto.response.*;
import com.tlaq.payment_service.entity.Cashier;
import com.tlaq.payment_service.entity.CashierNotDeposit;
import com.tlaq.payment_service.entity.Deposit;
import com.tlaq.payment_service.entity.enums.PaymentMethod;
import com.tlaq.payment_service.entity.enums.PaymentStatus;
import com.tlaq.payment_service.entity.enums.PaymentType;
import com.tlaq.payment_service.exceptions.AppException;
import com.tlaq.payment_service.exceptions.ErrorCode;
import com.tlaq.payment_service.mapper.CashierNotDepositMapper;
import com.tlaq.payment_service.message.PaymentStatusProducer;
import com.tlaq.payment_service.repository.CashierNotDepositRepository;
import com.tlaq.payment_service.repository.CashierRepository;
import com.tlaq.payment_service.repository.DepositRepository;
import com.tlaq.payment_service.repository.httpClient.MainClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class CashierService {
    @Autowired
    MainClient mainClient;

    @Autowired
    CashierRepository cashierRepository;

    @Autowired
    CashierNotDepositRepository cashierNotDepositRepository;

    @Autowired
    DepositRepository depositRepository;

    @Autowired
    PaymentStatusProducer paymentStatusProducer;

    @Autowired
    CashierNotDepositMapper cashierNotDepositMapper;

    public CashPaymentResponse getBill(String id) {
        Cashier cashier = cashierRepository.findById(id)
                .orElseThrow(()-> new AppException(ErrorCode.BILL_NOT_FOUND));
        return toCashPaymentResponse(cashier);
    }

    public CashPaymentResponse create(CashPaymentRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userKeyCloakId = authentication.getName();
        UserProfileResponse staff = mainClient.getProfile(userKeyCloakId).getResult();

        OrdersResponse ordersResponse = mainClient.getOrder(request.getOrderId()).getResult();


        Cashier cashier = cashierRepository.findByOrderId(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("CashierPayment not found for orderId: " + request.getOrderId()));

            cashier.getDeposit().setProfileId(ordersResponse.getProfile().getId());
            cashier.setStaffId(staff.getId());
            cashier.getDeposit().setPaymentMethod(PaymentMethod.CASHIER_TRANSFER);
            cashier.getDeposit().setPrice(ordersResponse.getOrderDetails().getTotalAmount());

        if (request.isSuccess()) {
            cashier.getDeposit().setStatus(PaymentStatus.SUCCESS);
            cashier.getDeposit().setType(PaymentType.PAID);
        } else {
            cashier.getDeposit().setStatus(PaymentStatus.FAIL);
            cashier.getDeposit().setType(PaymentType.CANCEL);

            paymentStatusProducer.failPaymentCash(
                    ResVNPayEvent.builder()
                            .code("97")
                            .message("fail")
                            .orderId(request.getOrderId())
                            .build()
            );
        }

        cashierRepository.save(cashier);
        return toCashPaymentResponse(cashier);
    }


    public List<DepositResponse> getAllReserver(){

        List<Deposit> getAllReserve= depositRepository.findAllExcludePaymentTypeSuccess(PaymentType.PAID);

        List<DepositResponse> listDepositResponse = new ArrayList<>();
        for (Deposit deposit : getAllReserve) {
            DepositResponse depositResponse = new DepositResponse();
            UserProfileResponse profile = mainClient.getProfileById
                    (deposit.getProfileId()).getResult();
            String fullName= profile.getLastName()+ " " + profile.getFirstName();

            depositResponse.setDepositAmount(deposit.getDepositAmount());
            depositResponse.setPrice(deposit.getPrice());
            depositResponse.setFullName(fullName);
            depositResponse.setPaymentMethod(deposit.getPaymentMethod());
            depositResponse.setOrderId(deposit.getOrderId());
            depositResponse.setRemainingAmount(deposit.getRemainingAmount());
            depositResponse.setCreatedAt(deposit.getCreatedAt());
            depositResponse.setTransactionId(deposit.getTransactionVNPayId());
            listDepositResponse.add(depositResponse);
        }
        return listDepositResponse;

    }



    private CashPaymentResponse toCashPaymentResponse(Cashier cashier) {
        UserProfileResponse client = mainClient.getProfileById(cashier.getDeposit().getProfileId()).getResult();

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userKeyCloakId = authentication.getName();
        UserProfileResponse staff = mainClient.getProfile(userKeyCloakId).getResult();

        return CashPaymentResponse.builder()
                .id(cashier.getId())
                .orderId(cashier.getDeposit().getOrderId())
                .price(cashier.getDeposit().getPrice())
                .paymentMethod(cashier.getDeposit().getPaymentMethod())
                .status(cashier.getDeposit().getStatus())
                .createdAt(cashier.getDeposit().getCreatedAt())
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



    public CashierNotDepositResponse createOrderByStaff(String orderId){
        OrdersResponse ordersResponse = mainClient.getOrder(orderId).getResult();

        Authentication authentication= SecurityContextHolder.getContext().getAuthentication();
        String userKeycloakId = authentication.getName();
        UserProfileResponse staff = mainClient.getProfile(userKeycloakId).getResult();

        CashierNotDeposit cashierNotDeposit = CashierNotDeposit.builder()
                .orderId(orderId)
                .type(PaymentType.PENDING)
                .price(ordersResponse.getOrderDetails().getTotalAmount())
                .paymentMethod(PaymentMethod.STAFF)
                .staffId(staff.getId())
                .profileId(ordersResponse.getProfile().getId())
                .build();

        cashierNotDepositRepository.save(cashierNotDeposit);
        return cashierNotDepositMapper.toCashierNotDepositResponse(cashierNotDeposit);
    }





}
