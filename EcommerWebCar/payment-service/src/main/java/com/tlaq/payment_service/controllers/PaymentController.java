package com.tlaq.payment_service.controllers;

import com.tlaq.payment_service.dto.ApiResponse;
import com.tlaq.payment_service.dto.response.OrderHistoryResponse;
import com.tlaq.payment_service.services.PartialPaymentService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@RestController
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PaymentController {
    PartialPaymentService partialPaymentService;

    @GetMapping("/api/get-my-payment")
    public ApiResponse<List<OrderHistoryResponse>> getOrderHistory(){
        return ApiResponse.<List<OrderHistoryResponse>>builder()
                .result(partialPaymentService.getOrderHistory())
                .build();
    }
}
