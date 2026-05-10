package com.tlaq.ordering_service.service.impl;

import com.tlaq.ordering_service.config.RabbitMQConfig;
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
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderManagementServiceImpl implements OrderManagementService {
    OrdersRepository ordersRepository;
    OrdersMapper ordersMapper;
    OrderHistoryService orderHistoryService;
    RabbitTemplate rabbitTemplate;

    @Override
    @Transactional
    public OrdersResponse updateStatus(String orderId, OrdersStatus newStatus, String note) {
        Orders order = ordersRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        // Kiểm tra hợp lệ State Machine
        validateStateTransition(order.getStatus(), newStatus);

        // 1. CHỈ GỬI LỆNH HOÀN KHO NẾU NHÂN VIÊN CHỌN HỦY ĐƠN (CANCELLED)
        if (newStatus == OrdersStatus.CANCELLED) {
            Map<String, Object> rollbackMsg = new HashMap<>();
            rollbackMsg.put("orderId", order.getId());
            rollbackMsg.put("rollback", true);
            List<Map<String, Object>> items = order.getOrderItems().stream().map(item -> {
                Map<String, Object> i = new HashMap<>();
                i.put("carId", item.getCarId());
                i.put("quantity", item.getQuantity());
                return i;
            }).toList();
            rollbackMsg.put("items", items);

            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.EXCHANGE,
                    RabbitMQConfig.INVENTORY_ROLLBACK_RK,
                    rollbackMsg
            );
            log.info("♻️ [RabbitMQ] Đã gửi yêu cầu hoàn kho (nhân viên hủy) cho đơn: {}", order.getId());
        }

        // 2. Cập nhật đúng trạng thái (newStatus) được truyền vào từ Controller
        order.setStatus(newStatus);

        // 3. Ghi lại lịch sử thao tác
        String staffName = SecurityContextHolder.getContext().getAuthentication().getName();
        String historyNote = (note != null && !note.trim().isEmpty()) ?
                "Nhân viên xử lý: " + note :
                "Hệ thống cập nhật trạng thái thành: " + newStatus;

        orderHistoryService.saveHistory(order, newStatus, historyNote, staffName);

        // 4. Lưu và trả về kết quả
        return ordersMapper.toOrdersResponse(ordersRepository.save(order));
    }

    private void validateStateTransition(OrdersStatus currentStatus, OrdersStatus newStatus) {
        if (currentStatus == newStatus) return;
        boolean isValid = false;
        switch (currentStatus) {
            case PENDING:
            case WAITING_FOR_PAY:
                isValid = (newStatus == OrdersStatus.DEPOSITED || newStatus == OrdersStatus.PAID || newStatus == OrdersStatus.CONFIRMED || newStatus == OrdersStatus.CANCELLED);
                break;
            case DEPOSITED:
                isValid = (newStatus == OrdersStatus.PAID || newStatus == OrdersStatus.CONFIRMED || newStatus == OrdersStatus.CANCELLED);
                break;
            case PAID:
                isValid = (newStatus == OrdersStatus.CONFIRMED || newStatus == OrdersStatus.CANCELLED);
                break;
            case CONFIRMED:
                isValid = (newStatus == OrdersStatus.DELIVERED || newStatus == OrdersStatus.CANCELLED);
                break;
            case DELIVERED:
            case COMPLETED:
            case CANCELLED:
                isValid = false; // Trạng thái cuối, không thể thay đổi
                break;
        }
        if (!isValid) {
            log.error("Invalid status transition from {} to {}", currentStatus, newStatus);
            throw new AppException(ErrorCode.INVALID_STATUS);
        }
    }

    @Override
    public PageResponse<OrdersResponse> getAllOrders(int page, int size, String status) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by("createdAt").descending());

        Page<Orders> pageData;
        if (status != null && !status.trim().isEmpty()) {
            OrdersStatus ordersStatus = parseStatus(status);
            pageData = ordersRepository.findByStatus(ordersStatus, pageable);
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

    private OrdersStatus parseStatus(String status) {
        try {
            return OrdersStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            log.error("Invalid status provided: {}", status);
            throw new AppException(ErrorCode.INVALID_STATUS);
        }
    }

    @Override
    public BigDecimal calculateRevenue(LocalDateTime start, LocalDateTime end) {
        // 1. Gọi Repository để tính tổng tiền [cite: 2026-03-12]
        BigDecimal total = ordersRepository.calculateTotalRevenue(
                start,
                end,
                OrdersStatus.DELIVERED
        );

        // 2. Tránh trả về null, trả về 0 nếu không có doanh thu [cite: 2026-03-12]
        return total != null ? total : BigDecimal.ZERO;
    }

    @Override
    public Map<OrdersStatus, Long> countOrdersByStatus() {
        Map<OrdersStatus, Long> stats = new HashMap<>();
        for (OrdersStatus status : OrdersStatus.values()) {
            stats.put(status, ordersRepository.countByStatus(status));
        }
        return stats;
    }

    @Override
    public List<MonthlyRevenueResponse> getYearlyRevenue(int year) {
        return ordersRepository.getMonthlyRevenue(year, OrdersStatus.DELIVERED);
    }
}
