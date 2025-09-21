package com.tlaq.payment_service.controllers;

import com.tlaq.payment_service.dto.ApiResponse;
import com.tlaq.payment_service.dto.event.ResVNPayEvent;
import com.tlaq.payment_service.dto.request.CashPaymentRequest;
import com.tlaq.payment_service.dto.request.OrderByStaffRequest;
import com.tlaq.payment_service.dto.response.CashPaymentResponse;
import com.tlaq.payment_service.dto.response.CashierNotDepositResponse;
import com.tlaq.payment_service.dto.response.DepositResponse;
import com.tlaq.payment_service.message.PaymentStatusProducer;
import com.tlaq.payment_service.services.CashierService;
import com.tlaq.payment_service.services.ReserveVNPayService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CashierController {
    CashierService cashierService;

    ReserveVNPayService reserveVNPayService;

    @GetMapping("/staff/get-bill/{id}")
    public ApiResponse<CashPaymentResponse> getBill(@PathVariable String id){
        return ApiResponse.<CashPaymentResponse>builder()
                .result(cashierService.getBill(id))
                .build();
    }

    @GetMapping("/staff/get-bill-deposit/{orderId}")
    public ApiResponse<DepositResponse> getBillDeposit(@PathVariable String orderId){
        return ApiResponse.<DepositResponse>builder()
                .result(reserveVNPayService.getDeposit(orderId))
                .build();
    }

    @GetMapping("/staff/get-all-deposit")
    public ApiResponse<List<DepositResponse>> getAllDeposit(){
        return ApiResponse.<List<DepositResponse>>builder()
                .result(cashierService.getAllReserver())
                .build();
    }



    @PostMapping("/staff/payment")
    public ApiResponse<CashPaymentResponse> payment(@RequestBody CashPaymentRequest request) {
        return ApiResponse.<CashPaymentResponse>builder()
                .result(cashierService.create(request))
                .build();
    }

    @PostMapping("/staff/payment-order-not-deposit")
    public ApiResponse<CashierNotDepositResponse> createPayment(@RequestBody OrderByStaffRequest request) {
        return ApiResponse.<CashierNotDepositResponse>builder()
                .result(cashierService.paymentOrderNotDeposit(request.getOrderId()))
                .build();

    }
}
