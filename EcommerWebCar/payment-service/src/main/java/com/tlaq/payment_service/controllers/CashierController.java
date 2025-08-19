package com.tlaq.payment_service.controllers;

import com.tlaq.payment_service.dto.ApiResponse;
import com.tlaq.payment_service.dto.request.CashPaymentRequest;
import com.tlaq.payment_service.dto.response.CashPaymentResponse;
import com.tlaq.payment_service.dto.response.DepositResponse;
import com.tlaq.payment_service.services.CashierService;
import com.tlaq.payment_service.services.ReserveVNPayService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/staff/checkout")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CashierController {
    CashierService cashierService;

    ReserveVNPayService reserveVNPayService;

    @GetMapping("/get-bill/{id}")
    public ApiResponse<CashPaymentResponse> getBill(@PathVariable String id){
        return ApiResponse.<CashPaymentResponse>builder()
                .result(cashierService.getBill(id))
                .build();
    }

    @GetMapping("/get-bill-deposit/{orderId}")
    public ApiResponse<DepositResponse> getBillDeposit(@PathVariable String orderId){
        return ApiResponse.<DepositResponse>builder()
                .result(reserveVNPayService.getDeposit(orderId))
                .build();
    }

    @PostMapping("/payment")
    public ApiResponse<CashPaymentResponse> payment(@RequestBody CashPaymentRequest request) {
        return ApiResponse.<CashPaymentResponse>builder()
                .result(cashierService.create(request))
                .build();
    }

}
