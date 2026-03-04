package com.tlaq.payment_service.mapper;

import com.tlaq.payment_service.dto.request.PaymentRequest;
import com.tlaq.payment_service.dto.response.PaymentResponse;
import com.tlaq.payment_service.dto.response.PaymentTransactionResponse;
import com.tlaq.payment_service.entity.Payment;
import com.tlaq.payment_service.entity.PaymentTransaction;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PaymentMapper {

    // Map từ Entity tổng quát sang Response [cite: 2026-03-03]
    @Mapping(target = "transactions", source = "transactions")
    PaymentResponse toPaymentResponse(Payment payment);

    // Map chi tiết từng giao dịch (Cọc, Trả nốt) [cite: 2026-03-03]
    PaymentTransactionResponse toTransactionResponse(PaymentTransaction transaction);

    // Map từ Request tạo thanh toán (Dùng khi Ordering Service gọi sang)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "transactions", ignore = true)
    @Mapping(target = "status", constant = "PENDING")
    @Mapping(target = "paidAmount", constant = "0")
    @Mapping(target = "remainAmount", source = "totalAmount")
    Payment toEntity(PaymentRequest request);
}