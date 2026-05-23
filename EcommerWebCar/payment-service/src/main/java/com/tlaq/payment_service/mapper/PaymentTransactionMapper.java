package com.tlaq.payment_service.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PaymentTransactionMapper {

    // Chuyển đổi lịch sử giao dịch để hiển thị Timeline thanh toán
    @Mapping(target = "orderId", source = "payment.orderId")
    com.tlaq.payment_service.dto.response.PaymentTransactionResponse toTransactionResponse(com.tlaq.payment_service.entity.PaymentTransaction transaction);

    // Dùng khi nhân viên xác nhận thu tiền mặt tại cửa hàng
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "payment", ignore = true)
    @Mapping(target = "vnpTransactionNo", ignore = true)
    @Mapping(target = "status", expression = "java(com.tlaq.payment_service.entity.enums.TransactionStatus.SUCCESS)")
    @Mapping(target = "createdAt", ignore = true)
    com.tlaq.payment_service.entity.PaymentTransaction toEntity(com.tlaq.payment_service.dto.request.OfflinePaymentRequest request);

    com.tlaq.payment_service.entity.PaymentTransaction toConfirmPayment(com.tlaq.payment_service.dto.request.ConfirmPaymentRequest request);
}