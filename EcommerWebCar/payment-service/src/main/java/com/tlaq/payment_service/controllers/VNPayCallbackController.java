package com.tlaq.payment_service.controllers;

import com.tlaq.payment_service.dto.ApiResponse;
import com.tlaq.payment_service.services.VNPayService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/payments/vnpay-callback")
@RequiredArgsConstructor
public class VNPayCallbackController {
    VNPayService vnPayService;

    @GetMapping
    public ApiResponse<String> handleVnpayReturn(@RequestParam Map<String, String> vnpParams) {
        // Xử lý cập nhật DB dựa trên tham số VNPAY trả về [cite: 2026-03-03]
        vnPayService.processVnpayCallback(vnpParams);

        String responseCode = vnpParams.get("vnp_ResponseCode");
        if ("00".equals(responseCode)) {
            return ApiResponse.<String>builder().result("Thanh toán cọc thành công! Chúc mừng bạn.").build();
        }
        return ApiResponse.<String>builder().result("Giao dịch thất bại hoặc đã bị hủy.").build();
    }
}