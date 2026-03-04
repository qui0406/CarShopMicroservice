package com.tlaq.ordering_service.service;

public interface OrderExportService {
    // Xuất hóa đơn/Phiếu thu dưới dạng byte array để trả về Browser
    byte[] exportOrderPdf(String orderId);

    // (Nâng cao) Gửi hóa đơn này qua Email cho khách hàng
    void sendOrderEmail(String orderId, String customerEmail);
}
