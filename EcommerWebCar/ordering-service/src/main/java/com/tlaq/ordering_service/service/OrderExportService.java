package com.tlaq.ordering_service.service;

public interface OrderExportService {
    byte[] exportOrderPdf(String orderId);
    void sendOrderEmail(String orderId, String customerEmail);
}
