package com.tlaq.payment_service.services.impl;

import com.tlaq.payment_service.configs.RabbitMQConfig;
import com.tlaq.payment_service.dto.response.OrdersResponse;
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
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
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
    RabbitTemplate rabbitTemplate;

    @Override
    @Transactional
    public VNPayResponse createPaymentUrl(String orderId, BigDecimal amount, String ipAddress, TransactionType type) {
        Boolean checkExistOrder = orderingClient.checkOrderId(orderId).getResult();
        if (!checkExistOrder) {
            throw new AppException(ErrorCode.ORDER_NOT_FOUND);
        }

        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseGet(() -> {
                    OrdersResponse orderInfo = orderingClient.getOrder(orderId).getResult();

                    // ← BỎ PaymentDetails detail = ...
                    // ← BỎ remainAmount
                    Payment newPayment = Payment.builder()
                            .orderId(orderId)
                            .totalAmount(orderInfo.getTotalAmount()) // snapshot từ Orders
                            .paidAmount(BigDecimal.ZERO)
                            // remainAmount tự tính qua getRemainAmount()
                            .status(PaymentStatus.PENDING)
                            .build();
                    return paymentRepository.save(newPayment);
                });

        // Kiểm tra deposit TRƯỚC khi tạo transaction
        // (logic cũ kiểm tra SAU khi đã build transaction object — không đúng)
        if (TransactionType.BALANCE.equals(type) && !isDepositReached(orderId)) {
            throw new AppException(ErrorCode.DEPOSITED_INVALID);
        }

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

        Map<String, String> hashParams = new HashMap<>();
        for (Map.Entry<String, String> entry : vnpParams.entrySet()) {
            String key = entry.getKey();
            String value = entry.getValue();
            if (key.startsWith("vnp_") && !key.equals("vnp_SecureHash") && !key.equals("vnp_SecureHashType")) {
                if (value != null && !value.isEmpty()) {
                    hashParams.put(key, value);
                }
            }
        }

        List<String> fieldNames = new ArrayList<>(hashParams.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        for (Iterator<String> itr = fieldNames.iterator(); itr.hasNext(); ) {
            String fieldName = itr.next();
            String fieldValue = hashParams.get(fieldName);
            hashData.append(fieldName).append('=').append(fieldValue);
            if (itr.hasNext()) {
                hashData.append('&');
            }
        }

        String checkSum = VNPayUtils.hmacSHA512(vnpayConfig.getHashSecret(), hashData.toString());
        if (!checkSum.equalsIgnoreCase(vnp_SecureHash)) {
            log.error("Chữ ký không khớp! Hệ thống: {}, VNPAY: {}", checkSum, vnp_SecureHash);
            throw new AppException(ErrorCode.INVALID_CHECKSUM);
        }

        String responseCode = vnpParams.get("vnp_ResponseCode");
        String txnRef = vnpParams.get("vnp_TxnRef");

        PaymentTransaction transaction = transactionRepository.findByTxnRef(txnRef)
                .orElseThrow(() -> new AppException(ErrorCode.TRANSACTION_NOT_FOUND));

        if ("00".equals(responseCode)) {
            transaction.setStatus(TransactionStatus.SUCCESS);
            transaction.setVnpTransactionNo(vnpParams.get("vnp_TransactionNo"));

            // 1. Cập nhật tiến độ tiền
            paymentService.updatePaymentProgress(transaction.getPayment(), transaction.getAmount());

            // ✅ Thêm: Gửi lệnh cập nhật status đơn hàng sang CONFIRMED
            String orderId = transaction.getPayment().getOrderId();
            Map<String, Object> confirmMsg = new HashMap<>();
            confirmMsg.put("orderId", orderId);
            confirmMsg.put("status", "CONFIRMED");

            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.EXCHANGE,
                    RabbitMQConfig.ORDER_CONFIRM_RK,
                    confirmMsg
            );
            log.info("Gửi lệnh xác nhận đơn hàng - OrderId: {}", orderId);

        } else {
            transaction.setStatus(TransactionStatus.FAILED);
        }
        transactionRepository.save(transaction);
    }

    private boolean isDepositReached(String orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));
        BigDecimal minDeposit = new BigDecimal("20000000");
        return payment.getPaidAmount().compareTo(minDeposit) >= 0;
    }

}
