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
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.producer.KafkaProducer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Map;
import java.util.TimeZone;

@Slf4j
@Service
@PropertySource("classpath:application.yml")
public class ReserveVNPayService {
    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private ReserveVNPayRepository reserveVNPayRepository;

    @Autowired
    private MainClient mainClient;

    @Autowired
    KafkaTemplate<String, Object> kafkaTemplate;


    public static final String VERSION = "2.1.0";
    public static final String COMMAND = "pay";
    public static final String ORDER_TYPE = "190000";
    public static final long DEFAULT_MULTIPLIER = 100L;

    @Value("${payment.vnpay.tmn-code}")
    private String tmnCode;

    @Value("${payment.vnpay.time-out}")
    private Integer paymentTimeout;

    public PaymentResponse init(OnlinePaymentRequest request){
        var amount = request.getAmount() * DEFAULT_MULTIPLIER;
        var txnRef = request.getTxnRef();
        var returnUrl = VNPayUtils.buildReturnUrl(txnRef);

        var vnCalendar = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        var createdDate = DateUtils.formatVnTime(vnCalendar);
        vnCalendar.add(Calendar.MINUTE, paymentTimeout);
        var expiredDate = DateUtils.formatVnTime(vnCalendar);

        var ipAddress = request.getIpAddress();

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

        params.put(VNPayParams.IP_ADDRESS, ipAddress);

        params.put(VNPayParams.LOCALE, LocaleUtils.VIETNAM.getCode());

        params.put(VNPayParams.ORDER_INFO, txnRef);
        params.put(VNPayParams.ORDER_TYPE, ORDER_TYPE);
        var initPaymentUrl = VNPayUtils.buildInitPaymentUrl(params);
        return PaymentResponse.builder()
                .vnpUrl(initPaymentUrl).build();
    }


    public DepositResponse getDeposit(String orderId){
        OrdersResponse ordersResponse= mainClient.getOrder(orderId).getResult();
        ReservePaymentVNPay reservePaymentVNPay = reserveVNPayRepository.findByOrderId(orderId)
                .orElseThrow(()-> new AppException(ErrorCode.ORDER_NOT_FOUND));

        return DepositResponse.builder()
                .orders(ordersResponse)
                .transactionId(reservePaymentVNPay.getTransactionVNPayId())
                .depositAmount(reservePaymentVNPay.getDepositAmount())
                .remainingAmount(reservePaymentVNPay.getRemainingAmount())
                .price(reservePaymentVNPay.getPrice())
                .createdAt(reservePaymentVNPay.getCreatedAt())
                .build();
    }


    public ResVNPayEvent process(Map<String, String> params) {
        String vnpResponseCode = params.get("vnp_ResponseCode");
        String orderId = params.get("vnp_TxnRef");
        String amountStr = params.get("vnp_Amount");
        String vnpBankTranNo = params.get("vnp_BankTranNo");

        BigDecimal amount = new BigDecimal(amountStr)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        if(!VNPayUtils.verifyIpn(params)) {
            return new ResVNPayEvent("97", "Signature fail", orderId);
        }

        OrdersResponse ordersResponse = mainClient.getOrder(orderId).getResult();

        String profileId = ordersResponse.getProfile().getId();
        BigDecimal price = ordersResponse.getOrderDetails().getTotalAmount();

        String emailClient= mainClient.getProfileById(profileId).getResult().getEmail();


        if(vnpResponseCode.equals("00")) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
            LocalDateTime dateTime = LocalDateTime.parse(params.get("vnp_PayDate"), formatter);
            ReservePaymentVNPay payment = ReservePaymentVNPay.builder()
                    .price(price)
                    .status(PaymentStatus.SUCCESS)
                    .createdAt(dateTime)
                    .paymentMethod(PaymentMethod.BANK_TRANSFER)
                    .orderId(orderId)
                    .depositAmount(amount)
                    .remainingAmount(price.subtract(amount))
                    .active(true)
                    .profileId(profileId)
                    .type(PaymentType.DEPOSIT)
                    .transactionVNPayId(vnpBankTranNo)
                    .build();

            paymentRepository.save(payment);


            NotificationEvent notificationEvent = NotificationEvent.builder()
                    .body("Chúc mừng bạn đã đặt cọc thành công với số tiền "+ amount
                            + "\nSố tiền còn lại mà quý khách thanh toán là: " + price.subtract(amount)
                    )
                    .channel("notification")
                    .subject("Thông báo về việc đặt cọc xe")
                    .recipient(emailClient)
                    .build();

            kafkaTemplate.send("notification-delivery", notificationEvent);

            return new ResVNPayEvent("00", "Success", orderId);
        }

        if(vnpResponseCode.equals("97")) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
            LocalDateTime dateTime = LocalDateTime.parse(params.get("vnp_PayDate"), formatter);

            ReservePaymentVNPay payment = ReservePaymentVNPay.builder()
                    .price(amount)
                    .status(PaymentStatus.FAIL)
                    .createdAt(dateTime)
                    .paymentMethod(PaymentMethod.BANK_TRANSFER)
                    .orderId(orderId)
                    .active(true)
                    .profileId(profileId)
                    .type(PaymentType.DEPOSIT)
                    .transactionVNPayId(vnpBankTranNo)
                    .build();

            paymentRepository.save(payment);

            NotificationEvent notificationEvent = NotificationEvent.builder()
                    .body("Bạn đã thanh toán không thành công. Vui lòng xem lại")
                    .channel("notification")
                    .subject("Thông báo về việc đặt cọc xe")
                    .recipient(emailClient)
                    .build();

            kafkaTemplate.send("notification-delivery", notificationEvent);

            return new ResVNPayEvent("97", "Signature", orderId);
        }
        return new  ResVNPayEvent("97", "Signature fail", orderId);
    }
}


