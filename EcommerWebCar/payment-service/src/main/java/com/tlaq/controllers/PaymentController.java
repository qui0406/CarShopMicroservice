package com.tlaq.controllers;

import com.tlaq.dto.ApiResponse;
import com.tlaq.dto.request.PaymentRequest;
import com.tlaq.dto.response.PaymentResponse;
import com.tlaq.dto.response.ResponseCodeVNPay;
import com.tlaq.services.PaymentService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/checkout")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PaymentController {
    @Autowired
    private PaymentService paymentService;

    @PostMapping("/url")
    public ResponseEntity<ApiResponse> checkout(@RequestBody PaymentRequest paymentRequest) {
        CompletableFuture<PaymentResponse> paymentResponse = paymentService.init(paymentRequest);
        ApiResponse apiResponse = ApiResponse.builder()
                .code(1000)
                .message("url")
                .result(paymentResponse)
                .build();

        return new ResponseEntity<>(apiResponse, HttpStatus.OK);
    }

    @GetMapping("/vnpay_ipn")
    public ResponseCodeVNPay payCallbackHandler(@RequestParam Map<String, String> params) {
        return paymentService.process(params);
    }
}
