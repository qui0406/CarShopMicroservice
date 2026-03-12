package com.tlaq.ordering_service.service.impl;

import com.tlaq.ordering_service.dto.PageResponse;
import com.tlaq.ordering_service.dto.response.MonthlyRevenueResponse;
import com.tlaq.ordering_service.dto.response.OrdersResponse;
import com.tlaq.ordering_service.entity.Orders;
import com.tlaq.ordering_service.entity.enums.OrdersStatus;
import com.tlaq.ordering_service.exceptions.AppException;
import com.tlaq.ordering_service.exceptions.ErrorCode;
import com.tlaq.ordering_service.mapper.OrdersMapper;
import com.tlaq.ordering_service.repo.OrdersRepository;
import com.tlaq.ordering_service.service.OrderHistoryService;
import com.tlaq.ordering_service.service.OrderManagementService;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderManagementServiceImpl implements OrderManagementService {
    OrdersRepository ordersRepository;
    OrdersMapper ordersMapper;
    OrderHistoryService orderHistoryService;

    @Override
    @Transactional
    public OrdersResponse updateStatus(String orderId, OrdersStatus newStatus, String note) {
        Orders order = ordersRepository.findById(orderId).orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
        order.setStatus(newStatus);

        String staffName = SecurityContextHolder.getContext().getAuthentication().getName();
        orderHistoryService.saveHistory(order, newStatus, "Nhân viên: " + note, staffName);

        return ordersMapper.toOrdersResponse(ordersRepository.save(order));
    }

    @Override
    public PageResponse<OrdersResponse> getAllOrders(int page, int size, String status) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by("createdAt").descending());

        // Xử lý an toàn: Nếu status rỗng hoặc null thì lấy hết
        Page<Orders> pageData;
        if (status != null && !status.isEmpty()) {
            pageData = ordersRepository.findByStatus(OrdersStatus.valueOf(status), pageable);
        } else {
            pageData = ordersRepository.findAll(pageable);
        }

        return PageResponse.<OrdersResponse>builder()
                .currentPage(page)
                .totalPages(pageData.getTotalPages())
                .totalElements(pageData.getTotalElements())
                .data(pageData.getContent().stream()
                        .map(ordersMapper::toOrdersResponse)
                        .toList())
                .build();
    }

    @Override
    public BigDecimal calculateRevenue(LocalDateTime start, LocalDateTime end) {
        // 1. Gọi Repository để tính tổng tiền [cite: 2026-03-12]
        BigDecimal total = ordersRepository.calculateTotalRevenue(
                start,
                end,
                OrdersStatus.COMPLETED
        );

        // 2. Tránh trả về null, trả về 0 nếu không có doanh thu [cite: 2026-03-12]
        return total != null ? total : BigDecimal.ZERO;
    }

    @Override
    public Map<OrdersStatus, Long> countOrdersByStatus() {
        return Map.of();
    }

    @Override
    public List<MonthlyRevenueResponse> getYearlyRevenue(int year) {
        return ordersRepository.getMonthlyRevenue(year, OrdersStatus.COMPLETED);
    }
}
