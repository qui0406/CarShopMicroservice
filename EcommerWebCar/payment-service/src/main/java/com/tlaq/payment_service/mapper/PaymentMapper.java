package com.tlaq.payment_service.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PaymentMapper {

    // Map từ Entity tổng quát sang Response [cite: 2026-03-03]
    @Mapping(target = "transactions", source = "transactions")
    com.tlaq.payment_service.dto.response.PaymentResponse toPaymentResponse(com.tlaq.payment_service.entity.Payment payment);
    
    @Mapping(target = "customerName", ignore = true)
    @Mapping(target = "address", ignore = true)
    @Mapping(target = "phone", ignore = true)
    com.tlaq.payment_service.dto.response.PaymentManagementResponse toManagementResponse(com.tlaq.payment_service.entity.Payment payment);

    // Map chi tiết từng giao dịch (Cọc, Trả nốt) [cite: 2026-03-03]
    com.tlaq.payment_service.dto.response.PaymentTransactionResponse toTransactionResponse(com.tlaq.payment_service.entity.PaymentTransaction transaction);

    // Map từ Request tạo thanh toán (Dùng khi Ordering Service gọi sang)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "transactions", ignore = true)
    @Mapping(target = "status", constant = "PENDING")
    @Mapping(target = "paidAmount", expression = "java(java.math.BigDecimal.ZERO)")
// Lưu ý: dùng expression cho BigDecimal.ZERO để chuẩn kiểu dữ liệu
    com.tlaq.payment_service.entity.Payment toEntity(com.tlaq.payment_service.dto.request.PaymentRequest request);
}