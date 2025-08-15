package com.tlaq.services;

import com.tlaq.dto.request.PaymentRequest;
import com.tlaq.dto.response.PaymentResponse;
import com.tlaq.dto.response.ResponseCodeVNPay;
import com.tlaq.entity.Payment;
import com.tlaq.entity.enums.MethodPayment;
import com.tlaq.entity.enums.PaymentStatus;
import com.tlaq.repository.PaymentRepository;
import com.tlaq.utils.DateUtils;
import com.tlaq.utils.ResponseCodeVNPayUtils;
import com.tlaq.utils.VNPayParams;
import com.tlaq.utils.VNPayUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Map;
import java.util.TimeZone;

@Service
@PropertySource("classpath:application.yml")
public class PaymentService {
    @Autowired
    private PaymentRepository  paymentRepository;

    public static final String VERSION = "2.1.0";
    public static final String COMMAND = "pay";
    public static final String ORDER_TYPE = "190000";
    public static long DEFAULT_MULTIPLIER = 100L;

    @Value("${payment.vnpay.tmn-code}")
    private String tmnCode;

    @Value("${payment.vnpay.timeout}")
    private Integer paymentTimeout;

    public PaymentResponse init(PaymentRequest request) {
        var amount = request.getAmount() * DEFAULT_MULTIPLIER;  // 1. amount * 100
        var txnRef = request.getTxnRef();                       // 2. registerId
        var returnUrl = VNPayUtils.buildReturnUrl(txnRef);                 // 3. FE redirect by returnUrl

        var vnCalendar = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        var createdDate = DateUtils.formatVnTime(vnCalendar);
        vnCalendar.add(Calendar.MINUTE, paymentTimeout);
        var expiredDate = DateUtils.formatVnTime(vnCalendar);  // 4. expiredDate for secure

        var ipAddress = request.getIpAddress();
        var orderInfo = VNPayUtils.buildPaymentDetail(txnRef);

        Map<String, String> params = new HashMap<>();

        params.put(VNPayParams.VERSION, VERSION);
        params.put(VNPayParams.COMMAND, COMMAND);

        params.put(VNPayParams.TMN_CODE, tmnCode);
        params.put(VNPayParams.AMOUNT, String.valueOf(amount));
        params.put(VNPayParams.CURRENCY, "VND");

        params.put(VNPayParams.TXN_REF, txnRef);
        params.put(VNPayParams.RETURN_URL, returnUrl);

        params.put(VNPayParams.CREATED_DATE, createdDate);
        params.put(VNPayParams.EXPIRE_DATE, expiredDate);

        params.put(VNPayParams.IP_ADDRESS, ipAddress);

        params.put(VNPayParams.LOCALE, "vn");

        params.put(VNPayParams.ORDER_INFO, txnRef);
        params.put(VNPayParams.ORDER_TYPE, ORDER_TYPE);

        var initPaymentUrl = VNPayUtils.buildInitPaymentUrl(params);
        return PaymentResponse.builder()
                .vnpUrl(initPaymentUrl).build();
    }

    public ResponseCodeVNPay process(Map<String, String> params) {
        if(!VNPayUtils.verifyIpn(params)) {
            return ResponseCodeVNPayUtils.SIGNATURE_FAILED;
        }
        String vnpResponseCode = params.get("vnp_ResponseCode");
        String orderId = params.get("vnp_TxnRef");
        String amountStr = params.get("vnp_Amount");
        BigDecimal amount = new BigDecimal(amountStr)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

//        Optional<Register> optionalRegister = registerRepository.findById(registerId);
//
//        if(optionalRegister.isEmpty())
//            return ResponseCodeVNPayUtils.ORDER_NOT_FOUND;


        if(vnpResponseCode.equals("00")) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
            LocalDateTime dateTime = LocalDateTime.parse(params.get("vnp_PayDate"), formatter);

//            Register register = optionalRegister.get();
            Payment payment = Payment
                    .builder()
                    .price(amount)
                    .status(PaymentStatus.SUCCESS)
                    .createdAt(dateTime)
                    .methodPayment(MethodPayment.BANK_TRANSFER)
                    .orderId(orderId)
                    .build();

//            register.addPayment(payment);
//            register.setStatus(RegisterStatus.SUCCESS);

            paymentRepository.save(payment);
//            registerRepository.update(register);

            return ResponseCodeVNPayUtils.SUCCESS;
        } else {

        }
        return ResponseCodeVNPayUtils.UNKNOWN_ERROR;
    }
}
