package com.tlaq.payment_service.services;

import com.tlaq.payment_service.dto.response.OrderHistoryResponse;
import com.tlaq.payment_service.entity.Deposit;
import com.tlaq.payment_service.repository.DepositRepository;
import com.tlaq.payment_service.repository.httpClient.MainClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class PartialPaymentService {
    @Autowired
    private DepositRepository depositRepository;

    @Autowired
    private MainClient mainClient;

    public List<OrderHistoryResponse> getOrderHistory(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userKeyCloakId= authentication.getName();

        String profileId= mainClient.getProfile(userKeyCloakId).getResult().getId();
        List<Deposit> deposits = depositRepository.findByProfileId(profileId);

        List<OrderHistoryResponse> orderHistoryResponse = new ArrayList<>();

        for(Deposit r: deposits){
            OrderHistoryResponse response=  new OrderHistoryResponse();

            response.setCreatedAt(r.getCreatedAt());
            response.setPrice(r.getPrice());
            response.setTransactionId(r.getTransactionVNPayId());
            response.setDisposableAmount(r.getDepositAmount());
            response.setRemainAmount(r.getRemainingAmount());
            response.setProfileId(r.getProfileId());
            response.setOrderId(r.getOrderId());
            orderHistoryResponse.add(response);
        }
        return orderHistoryResponse;
    }
}
