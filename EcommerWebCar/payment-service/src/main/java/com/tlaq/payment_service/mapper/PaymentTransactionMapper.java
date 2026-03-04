package com.tlaq.payment_service.mapper;

import com.tlaq.payment_service.dto.request.OfflinePaymentRequest;
import com.tlaq.payment_service.dto.response.PaymentTransactionResponse;
import com.tlaq.payment_service.entity.PaymentTransaction;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PaymentTransactionMapper {

    // Chuyển đổi lịch sử giao dịch để hiển thị Timeline thanh toán
    PaymentTransactionResponse toTransactionResponse(PaymentTransaction transaction);

    // Dùng khi nhân viên xác nhận thu tiền mặt tại cửa hàng
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "payment", ignore = true)
    @Mapping(target = "vnpTransactionNo", ignore = true)
    @Mapping(target = "status", expression = "java(com.tlaq.payment_service.entity.enums.TransactionStatus.SUCCESS)")
    @Mapping(target = "createdAt", ignore = true)
    PaymentTransaction toEntity(OfflinePaymentRequest request);
}