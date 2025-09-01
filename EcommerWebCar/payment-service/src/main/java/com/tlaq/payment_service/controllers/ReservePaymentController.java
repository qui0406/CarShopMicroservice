package com.tlaq.payment_service.controllers;

import com.tlaq.payment_service.dto.ApiResponse;
import com.tlaq.payment_service.dto.event.ResVNPayEvent;
import com.tlaq.payment_service.dto.request.OnlinePaymentRequest;
import com.tlaq.payment_service.dto.response.PaymentResponse;
import com.tlaq.payment_service.exceptions.AppException;
import com.tlaq.payment_service.exceptions.ErrorCode;
import com.tlaq.payment_service.services.ReserveVNPayService;
import com.tlaq.payment_service.utils.VNPayPartialsUtils;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import io.github.resilience4j.timelimiter.annotation.TimeLimiter;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

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

    ReserveVNPayService reserveVNPayService;

    @PostMapping("/url")
    @CircuitBreaker(name = "vnpayCircuitBreaker", fallbackMethod = "checkoutFallback")
    @Retry(name = "vnpayRetry")
    @TimeLimiter(name = "vnpayTimeLimiter")
    public CompletableFuture<ResponseEntity<ApiResponse<PaymentResponse>>> checkout(@RequestBody OnlinePaymentRequest onlinePaymentRequest) {
        log.info("Received checkout request for order: {}", onlinePaymentRequest.getTxnRef());
        return reserveVNPayService.init(onlinePaymentRequest)
                .thenApply(paymentResponse -> {
                    log.info("Checkout URL generated successfully for order: {}", onlinePaymentRequest.getTxnRef());
                    ApiResponse<PaymentResponse> apiResponse = ApiResponse.<PaymentResponse>builder()
                            .message("Payment URL generated successfully")
                            .result(paymentResponse)
                            .build();
                    return new ResponseEntity<>(apiResponse, HttpStatus.OK);
                })
                .exceptionally(throwable -> {
                    log.error("Error during checkout for order {}: {}", onlinePaymentRequest.getTxnRef(), throwable.getMessage());
                    throw new AppException(ErrorCode.PAYMENT_INIT_FAILED);
                });
    }

    // Fallback method for checkout
    public CompletableFuture<ResponseEntity<ApiResponse<PaymentResponse>>> checkoutFallback(OnlinePaymentRequest onlinePaymentRequest, Throwable t) {
        log.error("Fallback triggered for checkout, order: {}, error: {}", onlinePaymentRequest.getTxnRef(), t.getMessage());
        ApiResponse<PaymentResponse> apiResponse = ApiResponse.<PaymentResponse>builder()
                .message("Failed to generate payment URL due to server error. Please try again later.")
                .result(null)
                .build();
        return CompletableFuture.completedFuture(new ResponseEntity<>(apiResponse, HttpStatus.SERVICE_UNAVAILABLE));
    }

    @GetMapping("/vnpay_ipn")
    @CircuitBreaker(name = "vnpayCircuitBreaker", fallbackMethod = "payCallbackFallback")
    @Retry(name = "vnpayRetry")
    @TimeLimiter(name = "vnpayTimeLimiter")
    public CompletableFuture<Void> payCallbackHandler(@RequestParam Map<String, String> params, HttpServletResponse response) {
        String orderId = params.get("vnp_TxnRef");
        log.info("Received VNPay IPN callback for order: {}", orderId);

        return reserveVNPayService.process(params)
                .thenAccept(resVNPayEvent -> {
                    log.info("VNPay IPN processed for order: {}, status: {}", orderId, resVNPayEvent.getCode());
                    try {
                        // ✅ Build query string từ tất cả params
                        String queryString = params.entrySet().stream()
                                .map(entry -> entry.getKey() + "=" + entry.getValue())
                                .collect(Collectors.joining("&"));

                        // ✅ Thêm code vào query string
                        queryString += "&code=" + resVNPayEvent.getCode();

                        String redirectUrl = "http://localhost:3001/payment-result?" + queryString;
                        response.sendRedirect(redirectUrl);
                    } catch (IOException e) {
                        log.error("Failed to redirect after VNPay IPN for order {}: {}", orderId, e.getMessage());
                        throw new RuntimeException(e);
                    }
                })
                .exceptionally(throwable -> {
                    log.error("Error processing VNPay IPN for order {}: {}", orderId, throwable.getMessage());
                    try {
                        response.sendRedirect("http://localhost:3000/payment-result?code=500");
                    } catch (IOException e) {
                        log.error("Failed to redirect to error page for order {}: {}", orderId, e.getMessage());
                    }
                    return null;
                });
    }



    public CompletableFuture<ResVNPayEvent> payCallbackFallback(Map<String, String> params, Throwable t) {
        String orderId = params.getOrDefault("vnp_TxnRef", "unknown");
        log.error("Fallback triggered for VNPay IPN, order: {}, error: {}", orderId, t.getMessage());
        return CompletableFuture.completedFuture(new ResVNPayEvent("99", "System error during IPN processing", orderId));
    }

    @GetMapping("/payment/installment/{orderId}")
    @CircuitBreaker(name = "vnpayCircuitBreaker", fallbackMethod = "installmentFallback")
    @Retry(name = "vnpayRetry")
    @TimeLimiter(name = "vnpayTimeLimiter")
    public CompletableFuture<ResponseEntity<ApiResponse<String>>> createInstallmentPayment(
            @PathVariable String orderId,
            @RequestParam("amount") long amount,
            @RequestParam(value = "bankCode", required = false) String bankCode) {
        log.info("Creating installment payment for order: {}", orderId);
        try {
            String paymentUrl = VNPayPartialsUtils.buildInstallmentPaymentUrl(
                    tmnCode, secretKey, vnpUrl, returnUrl, orderId, amount, bankCode
            );
            log.info("Installment payment URL generated for order: {}", orderId);
            ApiResponse<String> apiResponse = ApiResponse.<String>builder()
                    .message("Installment payment URL generated successfully")
                    .result(paymentUrl)
                    .build();
            return CompletableFuture.completedFuture(new ResponseEntity<>(apiResponse, HttpStatus.OK));
        } catch (Exception e) {
            log.error("Error creating installment payment for order {}: {}", orderId, e.getMessage());
            throw new AppException(ErrorCode.PAYMENT_INIT_FAILED);
        }
    }

    // Fallback method for createInstallmentPayment
    public CompletableFuture<ResponseEntity<ApiResponse<String>>> installmentFallback(
            String orderId, long amount, String bankCode, Throwable t) {
        log.error("Fallback triggered for installment payment, order: {}, error: {}", orderId, t.getMessage());
        ApiResponse<String> apiResponse = ApiResponse.<String>builder()
                .message("Failed to generate installment payment URL due to server error. Please try again later.")
                .result(null)
                .build();
        return CompletableFuture.completedFuture(new ResponseEntity<>(apiResponse, HttpStatus.SERVICE_UNAVAILABLE));
    }
}