package com.tlaq.payment_service.services.impl;

import com.tlaq.payment_service.configs.RabbitMQConfig;
import com.tlaq.payment_service.dto.request.ConfirmPaymentRequest;
import com.tlaq.payment_service.dto.request.OfflinePaymentRequest;
import com.tlaq.payment_service.dto.request.PaymentRequest;
import com.tlaq.payment_service.dto.response.OrdersResponse;
import com.tlaq.payment_service.dto.response.PaymentResponse;
import com.tlaq.payment_service.entity.Payment;
import com.tlaq.payment_service.entity.PaymentTransaction;
import com.tlaq.payment_service.entity.enums.PaymentStatus;
import com.tlaq.payment_service.entity.enums.TransactionStatus;
import com.tlaq.payment_service.entity.enums.TransactionType;
import com.tlaq.payment_service.exceptions.AppException;
import com.tlaq.payment_service.exceptions.ErrorCode;
import com.tlaq.payment_service.mapper.PaymentMapper;
import com.tlaq.payment_service.mapper.PaymentTransactionMapper;
import com.tlaq.payment_service.repository.PaymentRepository;
import com.tlaq.payment_service.repository.PaymentTransactionRepository;
import com.tlaq.payment_service.repository.httpClient.IdentityClient;
import com.tlaq.payment_service.repository.httpClient.OrderingClient;
import com.tlaq.payment_service.services.PaymentService;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

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
    IdentityClient identityClient;
    OrderingClient orderingClient; // Thêm Client để lấy chi tiết thuế phí

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
        // ← BỎ: payment.setRemainAmount(...) — giờ là @Transient getter

        if (payment.getRemainAmount().compareTo(BigDecimal.ZERO) <= 0) {
            payment.setStatus(PaymentStatus.COMPLETED);
        } else {
            payment.setStatus(PaymentStatus.PARTIALLY_PAID);
        }

        return paymentMapper.toPaymentResponse(paymentRepository.save(payment));
    }

    @Override
    @Transactional
    public PaymentResponse confirmOfflinePayment(ConfirmPaymentRequest request) {
        Payment payment = paymentRepository.findById(request.getPaymentId())
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));

        if (!payment.getStatus().equals(PaymentStatus.PARTIALLY_PAID)) {
            log.error("Đơn hàng {} chưa được đặt cọc (Trạng thái: {}). Không thể thanh toán nốt.",
                    payment.getOrderId(), payment.getStatus());
            throw new AppException(ErrorCode.PAYMENT_STATUS_INVALID);
        }

        if (request.getAmount().compareTo(payment.getRemainAmount()) > 0) {
            throw new AppException(ErrorCode.INVALID_PAYMENT_AMOUNT);
        }

        // ← BỎ toàn bộ block: orderingClient.getOrder + payment.setDetail(...)
        // PaymentDetails đã bị xóa, không cần fetch lại breakdown từ Orders

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String staffId = identityClient.getProfileByUserKeycloakId(auth.getName()).getResult().getId();

        PaymentTransaction transaction = transactionMapper.toConfirmPayment(request);
        transaction.setPayment(payment);
        transaction.setStaffId(staffId);
        transaction.setStatus(TransactionStatus.SUCCESS);
        transaction.setType(payment.getPaidAmount().compareTo(BigDecimal.ZERO) == 0
                ? TransactionType.FULL_PAYMENT : TransactionType.BALANCE);

        transactionRepository.save(transaction);
        return updatePaymentProgress(payment, transaction.getAmount());
    }


    @Override
    @Transactional
    public PaymentResponse fullPayment(OfflinePaymentRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String staffId = identityClient.getProfileByUserKeycloakId(authentication.getName()).getResult().getId();

        OrdersResponse orderInfo = orderingClient.getOrder(request.getOrderId()).getResult();
        if (orderInfo == null) {
            throw new AppException(ErrorCode.ORDER_NOT_FOUND);
        }

        if (request.getAmount().compareTo(orderInfo.getTotalAmount()) != 0) {
            log.error("Sai lệch số tiền! Client: {}, Hệ thống: {}", request.getAmount(), orderInfo.getTotalAmount());
            throw new AppException(ErrorCode.INVALID_PAYMENT_AMOUNT);
        }

        Payment payment = paymentRepository.findByOrderId(request.getOrderId())
                .orElseGet(() -> paymentRepository.save(
                        Payment.builder()
                                .orderId(request.getOrderId())
                                .totalAmount(orderInfo.getTotalAmount()) // snapshot
                                .paidAmount(BigDecimal.ZERO)
                                // ← BỎ: remainAmount — là @Transient getter
                                // ← BỎ: detail — PaymentDetails đã xóa
                                .status(PaymentStatus.PENDING)
                                .build()
                ));

        PaymentTransaction transaction = PaymentTransaction.builder()
                .payment(payment)
                .type(TransactionType.FULL_PAYMENT)
                .method(request.getMethod())
                .amount(request.getAmount())
                .txnRef("OFFLINE-" + System.currentTimeMillis())
                .status(TransactionStatus.SUCCESS)
                .staffId(staffId)
                .note(request.getNote())
                .build();
        transactionRepository.save(transaction);

        sendInventoryUpdate(request.getOrderId());
        return updatePaymentProgress(payment, request.getAmount());
    }

    @Override
    public PaymentResponse getPaymentStatusByOrder(String orderId) {
        // 1. Tìm thông tin thanh toán trước
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));

        // 2. Lấy thông tin người đang truy cập từ Token
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userKeycloakId = auth.getName();

        // 3. Kiểm tra quyền STAFF
        boolean isStaff = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_STAFF"));

        // 4. Nếu không phải STAFF, bắt đầu kiểm tra quyền sở hữu
        if (!isStaff) {
            // Gọi sang Identity Service để lấy Profile ID của người đang đăng nhập
            String currentUserId = identityClient.getProfileByUserKeycloakId(userKeycloakId).getResult().getId();

            // Gọi sang Ordering Service để xem chủ đơn hàng là ai
            var orderResponse = orderingClient.getOrder(orderId).getResult();

            if (!orderResponse.getUserId().equals(currentUserId)) {
                log.warn("Cảnh báo: Người dùng {} cố tình xem trạng thái thanh toán của đơn hàng {} không thuộc quyền sở hữu",
                        userKeycloakId, orderId);
                throw new AppException(ErrorCode.UNAUTHORIZED);
            }
        }

        // 5. Nếu thỏa mãn điều kiện (là Staff hoặc Chủ đơn) thì mới trả về dữ liệu
        return paymentMapper.toPaymentResponse(payment);
    }

    @Override
    public boolean isDepositReached(String orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));
        BigDecimal minDeposit = new BigDecimal("20000000");
        return payment.getPaidAmount().compareTo(minDeposit) >= 0;
    }

    private void sendInventoryUpdate(String orderId) {
        try {
            // Lấy chi tiết đơn hàng để biết khách mua xe gì, số lượng bao nhiêu
            OrdersResponse orderInfo = orderingClient.getOrder(orderId).getResult();

            // Thường một đơn hàng xe chỉ có 1 item, nếu có nhiều thì dùng loop
            orderInfo.getOrderItems().forEach(item -> {
                Map<String, Object> message = new HashMap<>();
                message.put("carId", item.getCarId());
                message.put("quantity", item.getQuantity());
                message.put("type", "DECREASE"); // Đánh dấu là trừ kho

                rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE,
                        RabbitMQConfig.INVENTORY_ROUTING_KEY,
                        message);

                log.info("Đã gửi yêu cầu trừ kho cho CarId: {}, Số lượng: {}", item.getCarId(), item.getQuantity());
            });
        } catch (Exception e) {
            throw new AppException(ErrorCode.SEND_FAIL_RABBITMQ);
        }
    }
}