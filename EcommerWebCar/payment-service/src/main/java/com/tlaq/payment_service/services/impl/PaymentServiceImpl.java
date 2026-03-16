package com.tlaq.payment_service.services.impl;

import com.tlaq.payment_service.configs.RabbitMQConfig;
import com.tlaq.payment_service.dto.request.OfflinePaymentRequest;
import com.tlaq.payment_service.dto.request.PaymentRequest;
import com.tlaq.payment_service.dto.response.PaymentResponse;
import com.tlaq.payment_service.entity.Payment;
import com.tlaq.payment_service.entity.PaymentTransaction;
import com.tlaq.payment_service.entity.enums.PaymentMethod;
import com.tlaq.payment_service.entity.enums.PaymentStatus;
import com.tlaq.payment_service.entity.enums.TransactionStatus;
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
        BigDecimal totalPaid = payment.getPaidAmount().add(newAmount);
        payment.setPaidAmount(totalPaid);
        payment.setRemainAmount(payment.getTotalAmount().subtract(totalPaid));

        if (payment.getRemainAmount().compareTo(BigDecimal.ZERO) <= 0) {
            payment.setStatus(PaymentStatus.COMPLETED);
            rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE,
                    RabbitMQConfig.RK_PAYMENT_COMPLETED,
                    payment.getOrderId());
        } else {
            payment.setStatus(PaymentStatus.PARTIALLY_PAID);
        }

        return paymentMapper.toPaymentResponse(paymentRepository.save(payment));
    }


    // Xu ly so tien con lai khi da thanh toan coc
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
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));
        return paymentMapper.toPaymentResponse(payment);
    }


    //Tra truc tiep tai cua hang khong can coc
    @Override
    @Transactional
    public PaymentResponse processDeposit(String orderId, BigDecimal depositAmount, PaymentMethod method) {
        Payment payment = paymentRepository.findByOrderId(orderId).orElseThrow();

        // 1. Tạo Transaction Đặt cọc
        PaymentTransaction depositTxn = PaymentTransaction.builder()
                .payment(payment)
                .amount(depositAmount)
                .type(TransactionType.DEPOSIT)
                .method(method)
                .status(TransactionStatus.SUCCESS)
                .build();
        transactionRepository.save(depositTxn);

        // 2. Cập nhật trạng thái Payment sang PARTIALLY_PAID (Đã cọc)
        payment.setPaidAmount(payment.getPaidAmount().add(depositAmount));
        payment.setRemainAmount(payment.getTotalAmount().subtract(payment.getPaidAmount()));
        payment.setStatus(PaymentStatus.PARTIALLY_PAID);
        paymentRepository.save(payment);

        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE,
                "payment.deposit.success",
                payment.getOrderId());

        return paymentMapper.toPaymentResponse(payment);
    }

    @Override
    public boolean isDepositReached(String orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));

        BigDecimal minDeposit = new BigDecimal("20000000");
        return payment.getPaidAmount().compareTo(minDeposit) >= 0;
    }
}
