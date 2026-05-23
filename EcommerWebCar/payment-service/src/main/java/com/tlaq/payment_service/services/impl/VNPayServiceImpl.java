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
import com.tlaq.payment_service.repository.httpClient.IdentityClient;
import com.tlaq.event.dto.NotificationEvent;
import com.tlaq.payment_service.services.PaymentService;
import com.tlaq.payment_service.services.VNPayService;
import com.tlaq.payment_service.utils.VNPayConfig;
import com.tlaq.payment_service.utils.VNPayUtils;
import com.tlaq.payment_service.helper.PaymentHelper;
import feign.FeignException;
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
    IdentityClient identityClient;
    RabbitTemplate rabbitTemplate;
    PaymentHelper paymentHelper;

    @Override
    @Transactional
    public VNPayResponse createPaymentUrl(String orderId, String ipAddress, TransactionType type) {
        Boolean checkExistOrder = orderingClient.checkOrderId(orderId).getResult();
        if (!checkExistOrder) {
            throw new AppException(ErrorCode.ORDER_NOT_FOUND);
        }

        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseGet(() -> {
                    OrdersResponse orderInfo = null;
                    try {
                        orderInfo = orderingClient.getOrder(orderId).getResult();
                    }catch(FeignException.Forbidden e){
                        throw new AppException(ErrorCode.UNAUTHORIZED);
                    }catch(FeignException.NotFound e){
                        throw new AppException(ErrorCode.ORDER_NOT_FOUND);
                    }
                    catch(FeignException e){
                        throw new  AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
                    }


                    Payment newPayment = Payment.builder()
                            .orderId(orderId)
                            .totalAmount(orderInfo.getTotalAmount()) // snapshot từ Orders
                            .paidAmount(BigDecimal.ZERO)
                            // remainAmount tự tính qua getRemainAmount()
                            .status(PaymentStatus.PARTIALLY_PAID)
                            .build();
                    return paymentRepository.save(newPayment);
                });

        // Kiểm tra deposit TRƯỚC khi tạo transaction
        if (TransactionType.BALANCE.equals(type) && !paymentService.isDepositReached(orderId)) {
            throw new AppException(ErrorCode.DEPOSITED_INVALID);
        }

        BigDecimal amount;
        if (TransactionType.DEPOSIT.equals(type)) {
            // Cọc 1% giá trị xe (Giảm xuống để test VNPay không bị lỗi vượt hạn mức thẻ 100 triệu)
            amount = payment.getTotalAmount().multiply(new BigDecimal("0.01"));
        } else if (TransactionType.BALANCE.equals(type)) {
            // Thanh toán phần còn lại
            amount = payment.getRemainAmount();
        } else {
            // Thanh toán toàn bộ
            amount = payment.getTotalAmount();
        }

        // Issue 5.4: Tránh trùng lặp txnRef bằng cách thêm timestamp
        String txnRef = VNPayUtils.getRandomNumber(8) + "-" + System.currentTimeMillis();
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

        // Issue 5.3: VNPay Callback - Idempotency
        if (transaction.getStatus() == TransactionStatus.SUCCESS) {
            log.warn("Callback đã được xử lý thành công trước đó, bỏ qua: {}", txnRef);
            return;
        }

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

            // Gửi thông báo xe đã bán khi thanh toán hoàn tất
            if (transaction.getPayment().getStatus() == PaymentStatus.COMPLETED) {
                paymentHelper.sendCarSoldUpdate(orderId);
            }

            // Gửi Notification
            try {
                OrdersResponse orderInfo = orderingClient.getOrder(orderId).getResult();
                if (orderInfo != null && orderInfo.getUserId() != null) {
                    var userProfile = identityClient.getProfileById(orderInfo.getUserId()).getResult();
                    if (userProfile != null) {
                        Map<String, Object> params = new HashMap<>();
                        params.put("orderId", orderId);
                        params.put("amount", transaction.getAmount());

                        NotificationEvent notificationEvent = NotificationEvent.builder()
                                .type("PAYMENT_SUCCESS")
                                .channel("EMAIL")
                                .recipientId(userProfile.getId())
                                .recipientEmail(userProfile.getEmail())
                                .subject("Thanh toán thành công / Payment Successful")
                                .body("Thanh toán của bạn cho đơn hàng " + orderId + " với số tiền " + transaction.getAmount() + " đã thành công. Cảm ơn bạn đã mua sắm tại cửa hàng chúng tôi.")
                                .param(params)
                                .build();

                        rabbitTemplate.convertAndSend(
                                RabbitMQConfig.NOTIFICATION_EXCHANGE,
                                RabbitMQConfig.NOTIFICATION_ROUTING_KEY,
                                notificationEvent
                        );
                        log.info("Đã gửi sự kiện Notification cho OrderId: {}", orderId);
                    }
                }
            } catch (Exception e) {
                log.error("Lỗi gửi thông báo thanh toán thành công: {}", e.getMessage());
            }

        } else {
            transaction.setStatus(TransactionStatus.FAILED);
        }
        transactionRepository.save(transaction);
    }
}
