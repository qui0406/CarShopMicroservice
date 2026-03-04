package com.tlaq.payment_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VNPayResponse {
    String paymentUrl; // Link dẫn đến trang thanh toán của VNPAY
    String txnRef;     // Mã tham chiếu để Quí đối soát sau khi khách trả tiền xong
}