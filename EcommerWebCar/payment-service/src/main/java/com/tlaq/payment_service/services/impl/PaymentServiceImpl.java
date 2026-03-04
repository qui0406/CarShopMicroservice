package com.tlaq.payment_service.services.impl;

import com.tlaq.payment_service.configs.RabbitMQConfig;
import com.tlaq.payment_service.dto.request.OfflinePaymentRequest;
import com.tlaq.payment_service.dto.request.PaymentRequest;
import com.tlaq.payment_service.dto.response.PaymentResponse;
import com.tlaq.payment_service.entity.Payment;
import com.tlaq.payment_service.entity.PaymentTransaction;
import com.tlaq.payment_service.entity.enums.PaymentStatus;
import com.tlaq.payment_service.entity.enums.TransactionType;
import com.tlaq.payment_service.exceptions.AppException;
import com.tlaq.payment_service.exceptions.ErrorCode;
import com.tlaq.payment_service.mapper.PaymentMapper;
import com.tlaq.payment_service.mapper.PaymentTransactionMapper;
import com.tlaq.payment_service.repository.PaymentRepository;
import com.tlaq.payment_service.repository.PaymentTransactionRepository;
import com.tlaq.payment_service.services.PaymentService;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PaymentServiceImpl implements PaymentService {
    PaymentRepository paymentRepository;
    PaymentTransactionRepository transactionRepository;
    PaymentMapper paymentMapper;
    PaymentTransactionMapper transactionMapper;
    RabbitTemplate rabbitTemplate;

    @Override
    public void initializePayment(PaymentRequest request) {
        Payment payment = paymentMapper.toEntity(request);
        paymentRepository.save(payment);
        log.info("Initialized payment for order: {}", request.getOrderId());
    }

    @Override
    public PaymentResponse updatePaymentProgress(Payment payment, BigDecimal newAmount) {
        // Cộng dồn tiền đã trả
        BigDecimal totalPaid = payment.getPaidAmount().add(newAmount);
        payment.setPaidAmount(totalPaid);
        payment.setRemainAmount(payment.getTotalAmount().subtract(totalPaid));

        // Cập nhật trạng thái tổng quát
        if (payment.getRemainAmount().compareTo(BigDecimal.ZERO) <= 0) {
            payment.setStatus(PaymentStatus.COMPLETED);
            // Gửi tin nhắn báo cho Ordering Service đơn hàng đã thanh toán xong [cite: 2026-03-03]
            rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE,
                    RabbitMQConfig.RK_PAYMENT_COMPLETED,
                    payment.getOrderId());
        } else {
            payment.setStatus(PaymentStatus.PARTIALLY_PAID);
            // Nếu là cọc lần đầu, có thể gửi thông báo bắt đầu chuẩn bị xe
        }

        return paymentMapper.toPaymentResponse(paymentRepository.save(payment));
    }

    @Override
    @Transactional
    public PaymentResponse confirmOfflinePayment(OfflinePaymentRequest request) {
        Payment payment = paymentRepository.findById(request.getPaymentId())
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));

        // 1. Tạo Transaction tiền mặt/chuyển khoản tại showroom
        PaymentTransaction transaction = transactionMapper.toEntity(request);
        transaction.setPayment(payment);
        transaction.setType(payment.getPaidAmount().compareTo(BigDecimal.ZERO) == 0
                ? TransactionType.FULL_PAYMENT : TransactionType.BALANCE);

        transactionRepository.save(transaction);

        return updatePaymentProgress(payment, transaction.getAmount());
    }

    @Override
    public PaymentResponse getPaymentStatusByOrder(String orderId) {
        return null;
    }
}
