package com.tlaq.payment_service.utils;

import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

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

    // Hàm build URL thanh toán chuẩn VNPAY [cite: 2026-03-03]
    public String buildPaymentUrl(String txnRef, long amount, String ipAddress) {
        String vnp_Version = "2.1.0";
        String vnp_Command = "pay";
        String vnp_OrderInfo = "Dat coc xe o to - Ma don: " + txnRef;
        String vnp_OrderType = "other";
        String vnp_Locale = "vn";

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", tmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amount * 100)); // VNPAY tính theo đơn vị VNĐ * 100
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", txnRef);
        vnp_Params.put("vnp_OrderInfo", vnp_OrderInfo);
        vnp_Params.put("vnp_OrderType", vnp_OrderType);
        vnp_Params.put("vnp_Locale", vnp_Locale);
        vnp_Params.put("vnp_ReturnUrl", returnUrl);
        vnp_Params.put("vnp_IpAddr", ipAddress);

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        // Sắp xếp dữ liệu theo Alphabet [cite: 2026-03-03]
        List fieldNames = new ArrayList(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = (String) itr.next();
            String fieldValue = (String) vnp_Params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                // SỬA: hashData KHÔNG dùng URLEncode [cite: 2026-03-03]
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(fieldValue);

                // SỬA: query BẮT BUỘC dùng URLEncode [cite: 2026-03-03]
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII));
                query.append('=');
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));

                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }

        // Tạo mã Checksum (Secure Hash) [cite: 2026-03-03]
        String vnp_SecureHash = VNPayUtils.hmacSHA512(hashSecret, hashData.toString());
        String queryUrl = query.toString() + "&vnp_SecureHash=" + vnp_SecureHash;

        return vnpayUrl + "?" + queryUrl;
    }
}