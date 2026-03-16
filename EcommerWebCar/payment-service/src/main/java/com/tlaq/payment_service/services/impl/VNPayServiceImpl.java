package com.tlaq.payment_service.services.impl;

import com.tlaq.payment_service.dto.response.VNPayResponse;
import com.tlaq.payment_service.entity.Payment;
import com.tlaq.payment_service.entity.PaymentTransaction;
import com.tlaq.payment_service.entity.enums.PaymentMethod;
import com.tlaq.payment_service.entity.enums.PaymentStatus;
import com.tlaq.payment_service.entity.enums.TransactionStatus;
import com.tlaq.payment_service.entity.enums.TransactionType;
import com.tlaq.payment_service.exceptions.AppException;
import com.tlaq.payment_service.exceptions.ErrorCode;
import com.tlaq.payment_service.repository.PaymentRepository;
import com.tlaq.payment_service.repository.PaymentTransactionRepository;
import com.tlaq.payment_service.repository.httpClient.OrderingClient;
import com.tlaq.payment_service.services.PaymentService;
import com.tlaq.payment_service.services.VNPayService;
import com.tlaq.payment_service.utils.VNPayConfig;
import com.tlaq.payment_service.utils.VNPayUtils;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class VNPayServiceImpl implements VNPayService {
    VNPayConfig vnpayConfig;
    PaymentRepository paymentRepository;
    PaymentTransactionRepository transactionRepository;
    PaymentService paymentService;

    OrderingClient orderingClient;

    @Override
    @Transactional
    public VNPayResponse createPaymentUrl(String orderId, BigDecimal amount, String ipAddress, TransactionType type) {

        Boolean checkExistOrder = orderingClient.checkOrderId(orderId).getResult();
        if(!checkExistOrder){
            throw new AppException(ErrorCode.ORDER_NOT_FOUND);
        }

        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseGet(() -> {
                    var orderInfo = orderingClient.getOrder(orderId).getResult();
                    Payment newPayment = Payment.builder()
                            .orderId(orderId)
                            .totalAmount(orderInfo.getTotalAmount())
                            .paidAmount(BigDecimal.ZERO)
                            .remainAmount(orderInfo.getTotalAmount())
                            .status(PaymentStatus.PENDING)
                            .build();
                    return paymentRepository.save(newPayment);
                });

        String txnRef = VNPayUtils.getRandomNumber(8);

        PaymentTransaction transaction = PaymentTransaction.builder()
                .payment(payment)
                .amount(amount)
                .txnRef(txnRef)
                .type(type)
                .method(PaymentMethod.VNPAY)
                .status(TransactionStatus.PROCESSING)
                .build();
        transactionRepository.save(transaction);


        long amountToVNPay = amount.multiply(new BigDecimal(100)).longValue();
        String paymentUrl = vnpayConfig.buildPaymentUrl(txnRef, amountToVNPay, ipAddress);
        return VNPayResponse.builder()
                .paymentUrl(paymentUrl)
                .txnRef(txnRef)
                .build();
    }

    @Override
    @Transactional
    public void processVnpayCallback(Map<String, String> vnpParams) {
        String vnp_SecureHash = vnpParams.get("vnp_SecureHash");
        vnpParams.remove("vnp_SecureHashType");
        vnpParams.remove("vnp_SecureHash");

        List<String> fieldNames = new ArrayList<>(vnpParams.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        for (Iterator<String> itr = fieldNames.iterator(); itr.hasNext(); ) {
            String fieldName = itr.next();
            String fieldValue = vnpParams.get(fieldName);

            if (fieldValue != null && !fieldValue.isEmpty()) {
                hashData.append(fieldName).append('=').append(fieldValue); // ✅ raw value
                if (itr.hasNext()) {
                    hashData.append('&');
                }
            }
        }

        String checkSum = VNPayUtils.hmacSHA512(vnpayConfig.getHashSecret(), hashData.toString());

        log.info("HashData chuỗi input: {}", hashData);
        log.info("SecretKey đang dùng: [{}]", vnpayConfig.getHashSecret());

        if (!checkSum.equalsIgnoreCase(vnp_SecureHash)) {
            log.error("Chữ ký không khớp! Kiểm tra lại SecretKey hoặc logic nối chuỗi.");
            throw new AppException(ErrorCode.INVALID_CHECKSUM);
        }

        String responseCode = vnpParams.get("vnp_ResponseCode");
        String txnRef = vnpParams.get("vnp_TxnRef");

        PaymentTransaction transaction = transactionRepository.findByTxnRef(txnRef)
                .orElseThrow(() -> new AppException(ErrorCode.TRANSACTION_NOT_FOUND));

        if ("00".equals(responseCode)) {
            transaction.setStatus(TransactionStatus.SUCCESS);
            transaction.setVnpTransactionNo(vnpParams.get("vnp_TransactionNo"));

            paymentService.updatePaymentProgress(transaction.getPayment(), transaction.getAmount());
            log.info("Thanh toán thành công đơn hàng: {}", txnRef);
        } else {
            transaction.setStatus(TransactionStatus.FAILED);
            log.error("Thanh toán thất bại mã lỗi: {}", responseCode);
        }
        transactionRepository.save(transaction);
    }
}
