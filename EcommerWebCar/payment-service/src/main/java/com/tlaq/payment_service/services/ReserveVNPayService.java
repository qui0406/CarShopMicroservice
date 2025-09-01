package com.tlaq.payment_service.services;

import com.tlaq.event.dto.NotificationEvent;
import com.tlaq.payment_service.dto.event.ResVNPayEvent;
import com.tlaq.payment_service.dto.request.OnlinePaymentRequest;
import com.tlaq.payment_service.dto.response.DepositResponse;
import com.tlaq.payment_service.dto.response.OrdersResponse;
import com.tlaq.payment_service.dto.response.PaymentResponse;
import com.tlaq.payment_service.entity.ReservePaymentVNPay;
import com.tlaq.payment_service.entity.enums.PaymentMethod;
import com.tlaq.payment_service.entity.enums.PaymentStatus;
import com.tlaq.payment_service.entity.enums.PaymentType;
import com.tlaq.payment_service.exceptions.AppException;
import com.tlaq.payment_service.exceptions.ErrorCode;
import com.tlaq.payment_service.repository.PaymentRepository;
import com.tlaq.payment_service.repository.ReserveVNPayRepository;
import com.tlaq.payment_service.repository.httpClient.MainClient;
import com.tlaq.payment_service.utils.DateUtils;
import com.tlaq.payment_service.utils.LocaleUtils;
import com.tlaq.payment_service.utils.VNPayParams;
import com.tlaq.payment_service.utils.VNPayUtils;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import io.github.resilience4j.timelimiter.annotation.TimeLimiter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.CompletableFuture;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReserveVNPayService {

    private final PaymentRepository paymentRepository;
    private final ReserveVNPayRepository reserveVNPayRepository;
    private final MainClient mainClient;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public static final String VERSION = "2.1.0";
    public static final String COMMAND = "pay";
    public static final String ORDER_TYPE = "190000";
    public static final long DEFAULT_MULTIPLIER = 100L;

    @Value("${payment.vnpay.tmn-code}")
    private String tmnCode;

    @Value("${payment.vnpay.time-out}")
    private Integer paymentTimeout;

    /**
     * Khởi tạo thanh toán VNPay
     */
    @CircuitBreaker(name = "vnpayCircuitBreaker", fallbackMethod = "initFallback")
    @Retry(name = "vnpayRetry")
    @TimeLimiter(name = "vnpayTimeLimiter")
    public CompletableFuture<PaymentResponse> init(OnlinePaymentRequest request) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                long amount = request.getAmount() * DEFAULT_MULTIPLIER;
                String txnRef = request.getTxnRef();
                String returnUrl = VNPayUtils.buildReturnUrl(txnRef);

                Calendar vnCalendar = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
                String createdDate = DateUtils.formatVnTime(vnCalendar);
                vnCalendar.add(Calendar.MINUTE, paymentTimeout);
                String expiredDate = DateUtils.formatVnTime(vnCalendar);

                Map<String, String> params = new HashMap<>();
                params.put(VNPayParams.VERSION, VERSION);
                params.put(VNPayParams.COMMAND, COMMAND);
                params.put(VNPayParams.TMN_CODE, tmnCode);
                params.put(VNPayParams.AMOUNT, String.valueOf(amount));
                params.put(VNPayParams.CURRENCY, "vnd");
                params.put(VNPayParams.TXN_REF, txnRef);
                params.put(VNPayParams.RETURN_URL, returnUrl);
                params.put(VNPayParams.CREATED_DATE, createdDate);
                params.put(VNPayParams.EXPIRE_DATE, expiredDate);
                params.put(VNPayParams.IP_ADDRESS, request.getIpAddress());
                params.put(VNPayParams.LOCALE, LocaleUtils.VIETNAM.getCode());
                params.put(VNPayParams.ORDER_INFO, txnRef);
                params.put(VNPayParams.ORDER_TYPE, ORDER_TYPE);

                String initPaymentUrl = VNPayUtils.buildInitPaymentUrl(params);
                log.info("VNPay init URL generated for order {}", txnRef);

                return PaymentResponse.builder()
                        .vnpUrl(initPaymentUrl)
                        .build();
            } catch (Exception e) {
                log.error("Error initiating VNPay payment for order {}: {}", request.getTxnRef(), e.getMessage());
                throw new AppException(ErrorCode.PAYMENT_INIT_FAILED);
            }
        });
    }

    public CompletableFuture<PaymentResponse> initFallback(OnlinePaymentRequest request, Throwable t) {
        log.error("Fallback triggered for VNPay init, order: {}, error: {}", request.getTxnRef(), t.getMessage());
        return CompletableFuture.failedFuture(new AppException(ErrorCode.PAYMENT_INIT_FAILED));
    }

    /**
     * Xử lý callback từ VNPay (IPN)
     */
    @CircuitBreaker(name = "vnpayCircuitBreaker", fallbackMethod = "processFallback")
    @Retry(name = "vnpayRetry")
    @TimeLimiter(name = "vnpayTimeLimiter")
    public CompletableFuture<ResVNPayEvent> process(Map<String, String> params) {
        return CompletableFuture.supplyAsync(() -> {
            String orderId = params.get("vnp_TxnRef");
            String vnpResponseCode = params.get("vnp_ResponseCode");
            String amountStr = params.get("vnp_Amount");
            String vnpBankTranNo = params.get("vnp_BankTranNo");

            BigDecimal amount = new BigDecimal(amountStr)
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

            if (!VNPayUtils.verifyIpn(params)) {
                return new ResVNPayEvent("97", "Signature fail", orderId);
            }

            OrdersResponse ordersResponse = mainClient.getOrder(orderId).getResult();
            String profileId = ordersResponse.getProfile().getId();
            BigDecimal price = ordersResponse.getOrderDetails().getTotalAmount();

            if ("00".equals(vnpResponseCode)) {
                savePayment(orderId, vnpBankTranNo, profileId, price, amount, PaymentStatus.SUCCESS, params.get("vnp_PayDate"));
                return new ResVNPayEvent("00", "Success", orderId);
            } else {
                savePayment(orderId, vnpBankTranNo, profileId, amount, amount, PaymentStatus.FAIL, params.get("vnp_PayDate"));
                return new ResVNPayEvent(vnpResponseCode, "Payment failed", orderId);
            }
        });
    }

    public CompletableFuture<ResVNPayEvent> processFallback(Map<String, String> params, Throwable t) {
        String orderId = params.get("vnp_TxnRef");
        log.error("Fallback triggered for VNPay process, order: {}, error: {}", orderId, t.getMessage());
        return CompletableFuture.completedFuture(new ResVNPayEvent("99", "System error", orderId));
    }

    private void savePayment(String orderId, String vnpBankTranNo, String profileId, BigDecimal price,
                             BigDecimal depositAmount, PaymentStatus status, String payDate) {
        LocalDateTime dateTime = LocalDateTime.parse(payDate, DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        ReservePaymentVNPay payment = ReservePaymentVNPay.builder()
                .price(price)
                .status(status)
                .createdAt(dateTime)
                .paymentMethod(PaymentMethod.BANK_TRANSFER)
                .orderId(orderId)
                .depositAmount(depositAmount)
                .remainingAmount(price.subtract(depositAmount))
                .active(true)
                .profileId(profileId)
                .type(PaymentType.DEPOSIT)
                .transactionVNPayId(vnpBankTranNo)
                .build();
        paymentRepository.save(payment);
        log.info("Payment record saved for order {}, status {}", orderId, status);
    }

    public DepositResponse getDeposit(String orderId) {
        OrdersResponse ordersResponse = mainClient.getOrder(orderId).getResult();
        ReservePaymentVNPay reservePaymentVNPay = reserveVNPayRepository.findByOrderId(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        return DepositResponse.builder()
                .orders(ordersResponse)
                .transactionId(reservePaymentVNPay.getTransactionVNPayId())
                .depositAmount(reservePaymentVNPay.getDepositAmount())
                .remainingAmount(reservePaymentVNPay.getRemainingAmount())
                .price(reservePaymentVNPay.getPrice())
                .createdAt(reservePaymentVNPay.getCreatedAt())
                .build();
    }
}
