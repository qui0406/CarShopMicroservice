package com.tlaq.payment_service.services.impl;

import com.tlaq.payment_service.dto.response.PageResponse;
import com.tlaq.payment_service.dto.response.PaymentDetailsResponse;
import com.tlaq.payment_service.dto.response.PaymentManagementResponse;
import com.tlaq.payment_service.entity.Payment;
import com.tlaq.payment_service.entity.enums.PaymentStatus;
import com.tlaq.payment_service.exceptions.AppException;
import com.tlaq.payment_service.exceptions.ErrorCode;
import com.tlaq.payment_service.mapper.PaymentMapper;
import com.tlaq.payment_service.repository.PaymentRepository;
import com.tlaq.payment_service.repository.httpClient.OrderingClient;
import com.tlaq.payment_service.dto.response.OrdersDetailsResponse;
import com.tlaq.payment_service.services.PaymentManagementService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PaymentManagementServiceImpl implements PaymentManagementService {
    PaymentRepository paymentRepository;
    PaymentMapper paymentMapper;
    OrderingClient orderingClient;

    @Override
    public PageResponse<PaymentManagementResponse> getAllPaymentsForManagement(int page, int size, PaymentStatus status) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by("createdAt").descending());
        Page<Payment> payments = paymentRepository.findByStatus(status, pageable);

        List<PaymentManagementResponse> list = payments.stream().map(payment -> {
            PaymentManagementResponse response = paymentMapper.toManagementResponse(payment);

            try {
                // Lấy thông tin khách hàng từ Ordering Service qua orderId
                var orderResult = orderingClient.getOrder(payment.getOrderId()).getResult();
                if (orderResult != null && orderResult.getOrderItem() != null) {
                    var item = orderResult.getOrderItem();
                    response.setCustomerName(item.getFullName());
                    response.setPhone(item.getPhoneNumber());
                    response.setAddress(item.getAddress());
                    response.setCarName(item.getCarName());
                }
            } catch (Exception e) {
                log.error("Failed to fetch order info for management: {}", payment.getOrderId());
            }

            return response;
        }).toList();

        return PageResponse.<PaymentManagementResponse>builder()
                .currentPage(page)
                .pageSize(size)
                .totalElements(payments.getTotalElements())
                .totalPages(payments.getTotalPages())
                .data(list)
                .build();
    }

    @Override
    public PaymentDetailsResponse getPaymentDetails(String paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        
        PaymentDetailsResponse.PaymentDetailsResponseBuilder builder =
                com.tlaq.payment_service.dto.response.PaymentDetailsResponse.builder()
                .paymentId(payment.getId())
                .orderId(payment.getOrderId())
                .paymentStatus(payment.getStatus())
                .totalAmount(payment.getTotalAmount())
                .paidAmount(payment.getPaidAmount())
                .remainAmount(payment.getRemainAmount());

        try {
            var orderResult = orderingClient.getOrder(payment.getOrderId()).getResult();
            if (orderResult != null && orderResult.getOrderItem() != null) {
                var item = orderResult.getOrderItem();
                
                builder.customerDetails(com.tlaq.payment_service.dto.response.PaymentDetailsResponse.CustomerDetails.builder()
                        .fullName(item.getFullName())
                        .address(item.getAddress())
                        .dob(item.getDob())
                        .cccd(item.getCccd())
                        .phoneNumber(item.getPhoneNumber())
                        .build());

                builder.orderDetails(com.tlaq.payment_service.dto.response.PaymentDetailsResponse.OrderDetails.builder()
                        .carId(item.getCarId())
                        .carName(item.getCarName())
                        .build());
            }
        } catch (Exception e) {
            log.error("Failed to fetch order info for payment details: {}", payment.getOrderId());
        }

        return builder.build();
    }

    @Override
    @Transactional
    public void approveDeposit(String orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));
        if (payment.getStatus() == PaymentStatus.DEPOSITED) {
            payment.setStatus(PaymentStatus.PARTIALLY_PAID);
            paymentRepository.save(payment);
        }
    }
}
