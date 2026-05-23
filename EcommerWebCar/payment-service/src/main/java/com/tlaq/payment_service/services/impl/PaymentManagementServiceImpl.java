package com.tlaq.payment_service.services.impl;

import com.tlaq.payment_service.dto.response.PageResponse;
import com.tlaq.payment_service.dto.response.PaymentManagementResponse;
import com.tlaq.payment_service.entity.Payment;
import com.tlaq.payment_service.entity.enums.PaymentStatus;
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
                if (orderResult != null && orderResult.getOrderItems() != null && !orderResult.getOrderItems().isEmpty()) {
                    // Dùng Stream để kết hợp tên, SĐT và địa chỉ của tất cả items (tránh trùng lặp và hardcode get(0))
                    String customerName = orderResult.getOrderItems().stream()
                            .map(OrdersDetailsResponse::getFullName)
                            .filter(name -> name != null && !name.trim().isEmpty())
                            .distinct()
                            .collect(Collectors.joining(", "));

                    String phone = orderResult.getOrderItems().stream()
                            .map(OrdersDetailsResponse::getPhoneNumber)
                            .filter(p -> p != null && !p.trim().isEmpty())
                            .distinct()
                            .collect(Collectors.joining(", "));

                    String address = orderResult.getOrderItems().stream()
                            .map(OrdersDetailsResponse::getAddress)
                            .filter(a -> a != null && !a.trim().isEmpty())
                            .distinct()
                            .collect(Collectors.joining(" | "));

                    response.setCustomerName(customerName);
                    response.setPhone(phone);
                    response.setAddress(address);
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
}
