package com.tlaq.ordering_service.service.impl;

import com.tlaq.ordering_service.entity.Orders;
import com.tlaq.ordering_service.exceptions.AppException;
import com.tlaq.ordering_service.exceptions.ErrorCode;
import com.tlaq.ordering_service.repo.OrdersRepository;
import com.tlaq.ordering_service.service.OrderExportService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderExportServiceImpl implements OrderExportService {
    OrdersRepository ordersRepository;

    @Override
    public byte[] exportOrderPdf(String orderId) {
        return new byte[0];
    }

    @Override
    public void sendOrderEmail(String orderId, String customerEmail) {

    }
}