package com.tlaq.payment_service.controllers;

import com.tlaq.payment_service.dto.ApiResponse;
import com.tlaq.payment_service.dto.event.ResVNPayEvent;
import com.tlaq.payment_service.dto.request.OnlinePaymentRequest;
import com.tlaq.payment_service.dto.response.PaymentResponse;
import com.tlaq.payment_service.services.ReserveVNPayService;
import com.tlaq.payment_service.utils.VNPayPartialsUtils;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/checkout")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ReservePaymentController {
    @NonFinal
    @Value("${payment.vnpay.tmn-code}")
    String tmnCode;

    @NonFinal
    @Value("${payment.vnpay.secret-key}")
    String secretKey;

    @NonFinal
    @Value("${payment.vnpay.init-payment-url}")
    String vnpUrl;

    @NonFinal
    @Value("${payment.vnpay.return-url}")
    String returnUrl;

    ReserveVNPayService ReserveVNPayService;

    @PostMapping("/url")
    public ResponseEntity<ApiResponse> checkout(@RequestBody OnlinePaymentRequest onlinePaymentRequest) {
        PaymentResponse paymentResponse = ReserveVNPayService.init(onlinePaymentRequest);
        ApiResponse apiResponse = ApiResponse.builder()
                .message("url")
                .result(paymentResponse)
                .build();
        return new ResponseEntity<>(apiResponse, HttpStatus.OK);
    }

    @GetMapping("/vnpay_ipn")
    public ResVNPayEvent payCallbackHandler(@RequestParam Map<String, String> params) {
        ResVNPayEvent resVNPayEvent= ReserveVNPayService.process(params);
        return resVNPayEvent;
    }

    @GetMapping("/payment/installment/{orderId}")
    public String createInstallmentPayment(@PathVariable String orderId,
                                           @RequestParam("amount") long amount,
                                           @RequestParam(value = "bankCode", required = false) String bankCode) throws Exception {
        String paymentUrl = VNPayPartialsUtils.buildInstallmentPaymentUrl(
                tmnCode, secretKey, vnpUrl, returnUrl, orderId, amount, bankCode
        );
        return paymentUrl;
    }
}
