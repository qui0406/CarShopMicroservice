package com.tlaq.payment_service.services.impl;

import com.tlaq.payment_service.dto.response.VNPayResponse;
import com.tlaq.payment_service.entity.Payment;
import com.tlaq.payment_service.entity.PaymentTransaction;
import com.tlaq.payment_service.entity.enums.PaymentMethod;
import com.tlaq.payment_service.entity.enums.TransactionStatus;
import com.tlaq.payment_service.entity.enums.TransactionType;
import com.tlaq.payment_service.exceptions.AppException;
import com.tlaq.payment_service.exceptions.ErrorCode;
import com.tlaq.payment_service.repository.PaymentRepository;
import com.tlaq.payment_service.repository.PaymentTransactionRepository;
import com.tlaq.payment_service.services.PaymentService;
import com.tlaq.payment_service.services.VNPayService;
import com.tlaq.payment_service.utils.VNPayConfig;
import com.tlaq.payment_service.utils.VNPayUtils;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class VNPayServiceImpl implements VNPayService {
    PaymentRepository paymentRepository;
    PaymentTransactionRepository transactionRepository;
    VNPayConfig vnpayConfig;
    PaymentService paymentService;

    @Override
    @Transactional
    public VNPayResponse createDepositUrl(String paymentId, long amount, String ipAddress) {
        // 1. Kiểm tra đơn thanh toán có tồn tại không
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));

        // 2. Tạo mã tham chiếu duy nhất cho giao dịch này (txnRef)
        String txnRef = VNPayUtils.getRandomNumber(8);

        // 3. Tạo Transaction ở trạng thái PROCESSING [cite: 2026-03-03]
        PaymentTransaction transaction = PaymentTransaction.builder()
                .payment(payment)
                .amount(BigDecimal.valueOf(amount))
                .txnRef(txnRef)
                .type(TransactionType.DEPOSIT)
                .method(PaymentMethod.VNPAY)
                .status(TransactionStatus.PROCESSING)
                .build();
        transactionRepository.save(transaction);

        // 4. Gọi Utils để build URL thanh toán (Cần file VnpayUtils mình sẽ gửi dưới)
        String paymentUrl = vnpayConfig.buildPaymentUrl(txnRef, amount, ipAddress);

        return VNPayResponse.builder()
                .paymentUrl(paymentUrl)
                .txnRef(txnRef)
                .build();
    }

    @Override
    public void processVnpayCallback(Map<String, String> vnpParams) {
        String txnRef = vnpParams.get("vnp_TxnRef");
        String responseCode = vnpParams.get("vnp_ResponseCode");

        PaymentTransaction transaction = transactionRepository.findByTxnRef(txnRef)
                .orElseThrow(() -> new AppException(ErrorCode.TRANSACTION_NOT_FOUND));

        if ("00".equals(responseCode)) {
            transaction.setStatus(TransactionStatus.SUCCESS);
            transaction.setVnpTransactionNo(vnpParams.get("vnp_TransactionNo"));

            // Gọi sang PaymentService để cập nhật số dư cộng dồn [cite: 2026-03-03]
            paymentService.updatePaymentProgress(transaction.getPayment(), transaction.getAmount());
        } else {
            transaction.setStatus(TransactionStatus.FAILED);
        }
        transactionRepository.save(transaction);
    }
}
