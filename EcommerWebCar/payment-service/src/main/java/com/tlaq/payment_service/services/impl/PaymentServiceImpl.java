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
import com.tlaq.payment_service.helper.PaymentHelper;
import com.tlaq.payment_service.services.PaymentService;
import jakarta.transaction.Transactional;
import com.tlaq.event.dto.NotificationEvent;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import com.tlaq.payment_service.dto.response.PageResponse;
import com.tlaq.payment_service.dto.response.PaymentManagementResponse;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import com.tlaq.payment_service.services.FeeConfigService;
import com.tlaq.payment_service.repository.httpClient.CatalogClient;
import com.tlaq.payment_service.dto.response.CarResponse;

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
    PaymentHelper paymentHelper;
    FeeConfigService feeConfigService;
    CatalogClient catalogClient;

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
            // Nếu tổng tiền thanh toán mới chỉ bằng 1% (tiền cọc) thì là DEPOSITED
            BigDecimal depositThreshold = payment.getTotalAmount().multiply(new BigDecimal("0.01"));
            if (totalPaid.compareTo(depositThreshold) <= 0) {
                payment.setStatus(PaymentStatus.DEPOSITED);
            } else {
                payment.setStatus(PaymentStatus.PARTIALLY_PAID);
            }
        }

        return paymentMapper.toPaymentResponse(paymentRepository.save(payment));
    }

    @Override
    @Transactional
    public PaymentResponse confirmOfflinePayment(ConfirmPaymentRequest request) {
        Payment payment = paymentRepository.findById(request.getPaymentId())
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));

        if (!payment.getStatus().equals(PaymentStatus.PENDING) && !payment.getStatus().equals(PaymentStatus.PARTIALLY_PAID)) {
            log.error("Trạng thái thanh toán của đơn hàng {} không hợp lệ để xác nhận (Trạng thái: {}).",
                    payment.getOrderId(), payment.getStatus());
            throw new AppException(ErrorCode.PAYMENT_STATUS_INVALID);
        }

        BigDecimal expectedAmount;
        TransactionType txnType;
        if (payment.getStatus().equals(PaymentStatus.PENDING)) {
            // Xác nhận cọc offline (1% tổng giá trị xe)
            expectedAmount = payment.getTotalAmount().multiply(new BigDecimal("0.01"));
            txnType = TransactionType.DEPOSIT;
        } else {
            // Tính phí lăn bánh nếu chưa tính
            OrdersResponse orderInfo = orderingClient.getOrder(payment.getOrderId()).getResult();
            applyTaxesAndFeesIfNeeded(payment, orderInfo);
            // Xác nhận thanh toán phần còn lại offline
            expectedAmount = payment.getRemainAmount();
            txnType = TransactionType.BALANCE;
        }

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String staffId = identityClient.getProfileByUserKeycloakId(auth.getName()).getResult().getId();

        PaymentTransaction transaction = transactionMapper.toConfirmPayment(request);
        transaction.setAmount(expectedAmount);
        transaction.setPayment(payment);
        transaction.setStaffId(staffId);
        transaction.setStatus(TransactionStatus.SUCCESS);
        transaction.setType(txnType);

        transactionRepository.save(transaction);
        
        Map<String, Object> confirmMsg = new HashMap<>();
        confirmMsg.put("orderId", payment.getOrderId());
        confirmMsg.put("status", "CONFIRMED");

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE,
                RabbitMQConfig.ORDER_CONFIRM_RK,
                confirmMsg
        );
        log.info("Gửi lệnh xác nhận thanh toán (offline) - OrderId: {}, Loại: {}", payment.getOrderId(), txnType);
        
        sendSuccessNotification(payment.getOrderId(), transaction.getAmount(), null);

        PaymentResponse result = updatePaymentProgress(payment, transaction.getAmount());

        // Gửi thông báo xe đã bán khi thanh toán hoàn tất
        if (payment.getStatus() == PaymentStatus.COMPLETED) {
            paymentHelper.sendCarSoldUpdate(payment.getOrderId());
        }

        return result;
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

        Payment payment = paymentRepository.findByOrderId(request.getOrderId())
                .orElseGet(() -> paymentRepository.save(
                        Payment.builder()
                                .orderId(request.getOrderId())
                                .totalAmount(orderInfo.getBaseAmount() != null ? orderInfo.getBaseAmount() : orderInfo.getTotalAmount()) // base amount
                                .paidAmount(BigDecimal.ZERO)
                                .status(PaymentStatus.PENDING)
                                .build()
                ));

        if (payment.getPaidAmount().compareTo(BigDecimal.ZERO) > 0) {
            log.error("Đơn hàng {} đã được thanh toán một phần. Không thể dùng API fullPayment.", request.getOrderId());
            throw new AppException(ErrorCode.PAYMENT_STATUS_INVALID);
        }

        // Áp dụng thuế và lệ phí
        applyTaxesAndFeesIfNeeded(payment, orderInfo);
        BigDecimal expectedAmount = payment.getTotalAmount();

        PaymentTransaction transaction = PaymentTransaction.builder()
                .payment(payment)
                .type(TransactionType.FULL_PAYMENT)
                .method(request.getMethod())
                .amount(expectedAmount)
                .txnRef("OFFLINE-" + System.currentTimeMillis())
                .status(TransactionStatus.SUCCESS)
                .staffId(staffId)
                .note(request.getNote())
                .build();
        transactionRepository.save(transaction);

        Map<String, Object> confirmMsg = new HashMap<>();
        confirmMsg.put("orderId", request.getOrderId());
        confirmMsg.put("status", "CONFIRMED");

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE,
                RabbitMQConfig.ORDER_CONFIRM_RK,
                confirmMsg
        );
        log.info("Gửi lệnh xác nhận thanh toán toàn bộ (offline) - OrderId: {}", request.getOrderId());
        
        sendSuccessNotification(request.getOrderId(), expectedAmount, orderInfo.getUserId());

        PaymentResponse result = updatePaymentProgress(payment, expectedAmount);

        // fullPayment luôn hoàn tất → gửi thông báo xe đã bán
        paymentHelper.sendCarSoldUpdate(request.getOrderId());

        return result;
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
        // Tính 10% tổng giá trị xe (Issue: Loại bỏ hardcode 20 triệu)
        BigDecimal minDeposit = payment.getTotalAmount().multiply(new BigDecimal("0.1"));
        return payment.getPaidAmount().compareTo(minDeposit) >= 0;
    }

    // Đã thay thế sendInventoryUpdate bằng PaymentHelper.sendCarSoldUpdate

    private void sendSuccessNotification(String orderId, BigDecimal amount, String userId) {
        try {
            if (userId == null) {
                OrdersResponse orderInfo = orderingClient.getOrder(orderId).getResult();
                if (orderInfo != null) userId = orderInfo.getUserId();
            }
            if (userId != null) {
                var userProfile = identityClient.getProfileById(userId).getResult();
                if (userProfile != null) {
                    Map<String, Object> params = new HashMap<>();
                    params.put("orderId", orderId);
                    params.put("amount", amount);

                    NotificationEvent notificationEvent = NotificationEvent.builder()
                            .type("PAYMENT_SUCCESS")
                            .channel("EMAIL")
                            .recipientId(userProfile.getId())
                            .recipientEmail(userProfile.getEmail())
                            .subject("Thanh toán Offline thành công / Offline Payment Successful")
                            .body("Thanh toán trực tiếp của bạn cho đơn hàng " + orderId + " với số tiền " + amount + " đã được xác nhận. Cảm ơn bạn đã mua sắm.")
                            .param(params)
                            .build();

                    rabbitTemplate.convertAndSend(
                            RabbitMQConfig.NOTIFICATION_EXCHANGE,
                            RabbitMQConfig.NOTIFICATION_ROUTING_KEY,
                            notificationEvent
                    );
                    log.info("Đã gửi sự kiện Notification cho thanh toán offline OrderId: {}", orderId);
                }
            }
        } catch (Exception e) {
            log.error("Lỗi gửi thông báo thanh toán offline thành công: {}", e.getMessage());
        }
    }

    @Override
    @Transactional
    public PaymentResponse cancelPayment(String orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));

        payment.setStatus(PaymentStatus.CANCELLED);
        return paymentMapper.toPaymentResponse(paymentRepository.save(payment));
    }

    private void applyTaxesAndFeesIfNeeded(Payment payment, OrdersResponse orderInfo) {
        // Nếu đã tính thuế (có baseAmount) thì bỏ qua
        if (payment.getBaseAmount() != null && payment.getBaseAmount().compareTo(BigDecimal.ZERO) > 0) {
            return;
        }
        
        String carId = orderInfo.getOrderItem().getCarId();
        CarResponse car = catalogClient.getProductById(carId).getResult();
        if (car == null) throw new AppException(ErrorCode.CAR_NOT_FOUND);

        String region = feeConfigService.resolveRegion(orderInfo.getOrderItem().getAddress());
        String fuelType = car.getFuelType() != null ? car.getFuelType() : "GASOLINE";
        BigDecimal base = payment.getTotalAmount(); // Lúc này totalAmount mới chỉ là base

        BigDecimal taxRate = feeConfigService.getRegistrationTaxRate(region, fuelType);
        BigDecimal tax = base.multiply(taxRate);
        BigDecimal plate = feeConfigService.getPlateFee(region);
        BigDecimal inspect = feeConfigService.getInspectionFee();

        payment.setBaseAmount(base);
        payment.setTaxAmount(tax);
        payment.setPlateFeeAmount(plate);
        payment.setInsuranceAmount(inspect);
        payment.setTotalAmount(base.add(tax).add(plate).add(inspect));
    }
}