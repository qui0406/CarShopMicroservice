package com.tlaq.payment_service.utils;

import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.io.UnsupportedEncodingException;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Configuration
@Data
public class VNPayConfig {
    @Value("${payment.vnpay.tmn-code}")
    String tmnCode;

    @Value("${payment.vnpay.hash-secret}")
    String hashSecret;

    @Value("${payment.vnpay.url}")
    String vnpayUrl;

    @Value("${payment.vnpay.return-url}")
    String returnUrl;

    public String buildPaymentUrl(String txnRef, long amount, String ipAddress) {
        Map<String, String> vnp_Params = new TreeMap<>(); // TreeMap tự sort luôn
        vnp_Params.put("vnp_Version", "2.1.0");
        vnp_Params.put("vnp_Command", "pay");
        vnp_Params.put("vnp_TmnCode", tmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", txnRef);
        vnp_Params.put("vnp_OrderInfo", "Dat coc xe o to - Ma don: " + txnRef);
        vnp_Params.put("vnp_OrderType", "other");
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", returnUrl);
        vnp_Params.put("vnp_IpAddr", ipAddress);

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        vnp_Params.put("vnp_CreateDate", formatter.format(cld.getTime()));

        // Build hashData - KHÔNG encode
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        for (Map.Entry<String, String> entry : vnp_Params.entrySet()) {
            String key = entry.getKey();
            String value = entry.getValue();
            if (value != null && !value.isEmpty()) {
                // hashData dùng UTF_8 encode
                hashData.append(URLEncoder.encode(key, StandardCharsets.UTF_8))
                        .append('=')
                        .append(URLEncoder.encode(value, StandardCharsets.UTF_8))
                        .append('&');
                // query cũng dùng UTF_8
                query.append(URLEncoder.encode(key, StandardCharsets.UTF_8))
                        .append('=')
                        .append(URLEncoder.encode(value, StandardCharsets.UTF_8))
                        .append('&');
            }
        }

        // Xóa dấu '&' cuối
        hashData.deleteCharAt(hashData.length() - 1);
        query.deleteCharAt(query.length() - 1);

        String vnp_SecureHash = VNPayUtils.hmacSHA512(hashSecret, hashData.toString());

        // Log để debug
        System.out.println("=== VNPAY DEBUG ===");
        System.out.println("HashData: " + hashData);
        System.out.println("SecureHash: " + vnp_SecureHash);
        System.out.println("ReturnUrl: " + returnUrl);

        return vnpayUrl + "?" + query + "&vnp_SecureHash=" + vnp_SecureHash;
    }
}