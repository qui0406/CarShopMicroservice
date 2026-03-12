package com.tlaq.ordering_service.service.impl;

import com.tlaq.ordering_service.dto.response.OrdersHistoryResponse;
import com.tlaq.ordering_service.entity.Orders;
import com.tlaq.ordering_service.entity.OrdersHistory;
import com.tlaq.ordering_service.entity.enums.OrdersStatus;
import com.tlaq.ordering_service.mapper.OrdersMapper;
import com.tlaq.ordering_service.repo.OrdersHistoryRepository;
import com.tlaq.ordering_service.service.OrderHistoryService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderHistoryServiceImpl implements OrderHistoryService {
    OrdersHistoryRepository ordersHistoryRepository;
    OrdersMapper ordersMapper;

    @Override
    public void saveHistory(Orders order, OrdersStatus status, String note, String actorId) {
        OrdersHistory history = OrdersHistory.builder()
                .order(order)
                .status(status)
                .note(note)
                .updatedBy(actorId)
                .build();

        ordersHistoryRepository.save(history);
    }

    @Override
    public List<OrdersHistoryResponse> getOrderTimeline(String orderId) {
        return ordersHistoryRepository.findByOrderIdOrderByCreatedAtAsc(orderId).stream()
                .map(ordersMapper::toOrdersHistoryResponse).toList();
    }

    @Override
    public void handlePaymentSuccess(String orderId) {

    }
}