package com.tlaq.ordering_service.service.impl;

import com.tlaq.ordering_service.config.RabbitMQConfig;
import com.tlaq.ordering_service.dto.PageResponse;
import com.tlaq.ordering_service.dto.response.OrdersResponse;
import com.tlaq.ordering_service.dto.response.RevenueReportResponse;
import com.tlaq.ordering_service.dto.response.BrandSalesResponse;
import com.tlaq.ordering_service.entity.Orders;
import com.tlaq.ordering_service.entity.enums.OrdersStatus;
import com.tlaq.ordering_service.exceptions.AppException;
import com.tlaq.ordering_service.exceptions.ErrorCode;
import com.tlaq.ordering_service.mapper.OrdersMapper;
import com.tlaq.ordering_service.repo.OrdersRepository;
import com.tlaq.ordering_service.repo.httpClient.CatalogClient;
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

import java.time.LocalDateTime;
import java.time.LocalDate;
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
    CatalogClient catalogClient;

    @Override
    @Transactional
    public OrdersResponse updateStatus(String orderId, OrdersStatus newStatus, String note) {
        Orders order = ordersRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        // Kiểm tra hợp lệ State Machine
        validateStateTransition(order.getStatus(), newStatus);

        // 1. HỦY GIỮ XE NẾU NHÂN VIÊN CHỌN HỦY ĐƠN (CANCELLED)
        if (newStatus == OrdersStatus.CANCELLED) {
            if (order.getOrderItem() != null && order.getOrderItem().getCarId() != null) {
                try {
                    catalogClient.unmarkCarDeposited(order.getOrderItem().getCarId());
                    log.info("♻️ Đã hủy giữ xe (nhân viên hủy) cho đơn: {}, xe: {}", order.getId(), order.getOrderItem().getCarId());
                } catch (Exception e) {
                    log.error("Lỗi khi hủy giữ xe {}: {}", order.getOrderItem().getCarId(), e.getMessage());
                }
            }
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
        Orders savedOrder = ordersRepository.save(order);
        OrdersResponse response = ordersMapper.toOrdersResponse(savedOrder);
        populateCarNames(response);
        return response;
    }

    private void validateStateTransition(OrdersStatus currentStatus, OrdersStatus newStatus) {
        if (currentStatus == newStatus) return;
        boolean isValid = false;
        switch (currentStatus) {
            case PENDING:
                isValid = (newStatus == OrdersStatus.DEPOSITED || newStatus == OrdersStatus.CANCELLED);
                break;
            case DEPOSITED:
                isValid = (newStatus == OrdersStatus.WAITING_FOR_PAID || newStatus == OrdersStatus.CANCELLED);
                break;
            case WAITING_FOR_PAID:
                isValid = (newStatus == OrdersStatus.PAID || newStatus == OrdersStatus.CANCELLED);
                break;
            case PAID:
                isValid = (newStatus == OrdersStatus.DELIVERED || newStatus == OrdersStatus.CANCELLED);
                break;
            case DELIVERED:
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
                        .map(order -> {
                            OrdersResponse response = ordersMapper.toOrdersResponse(order);
                            populateCarNames(response);
                            return response;
                        })
                        .toList())
                .build();
    }

    private void populateCarNames(OrdersResponse response) {
        if (response.getOrderItem() != null) {
            try {
                var carRes = catalogClient.getProductById(response.getOrderItem().getCarId());
                if (carRes != null && carRes.getResult() != null) {
                    response.getOrderItem().setCarName(carRes.getResult().getName());
                }
            } catch (Exception e) {
                log.error("Error fetching car name for carId: {}. Error: {}", response.getOrderItem().getCarId(), e.getMessage());
            }
            // Set top-level carName for convenience in UI tables
            response.setCarName(response.getOrderItem().getCarName());
        }
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
    public java.util.Map<String, Long> getStatusCount() {
        List<Object[]> results = ordersRepository.countByStatus();
        Map<String, Long> map = new HashMap<>();
        for (Object[] row : results) {
            OrdersStatus status = (OrdersStatus) row[0];
            Long count = (Long) row[1];
            map.put(status.name(), count);
        }
        return map;
    }

    @Override
    public List<RevenueReportResponse> getRevenueReport(Integer year, Integer month) {
        if (year == null) {
            year = java.time.LocalDate.now().getYear();
        }

        LocalDateTime start;
        LocalDateTime end;
        boolean isDaily = (month != null);

        if (isDaily) {
            java.time.LocalDate date = java.time.LocalDate.of(year, month, 1);
            start = date.atStartOfDay();
            end = date.withDayOfMonth(date.lengthOfMonth()).atTime(23, 59, 59);
        } else {
            start = LocalDateTime.of(year, 1, 1, 0, 0, 0);
            end = LocalDateTime.of(year, 12, 31, 23, 59, 59);
        }

        List<Orders> orders = ordersRepository.findByStatusInAndCreatedAtBetween(
                List.of(OrdersStatus.PAID, OrdersStatus.DELIVERED),
                start,
                end
        );

        if (isDaily) {
            int days = start.toLocalDate().lengthOfMonth();
            Map<Integer, RevenueReportResponse> dayMap = new HashMap<>();
            for (int d = 1; d <= days; d++) {
                dayMap.put(d, RevenueReportResponse.builder()
                        .label(String.format("%02d/%02d", d, month))
                        .totalOrders(0L)
                        .totalRevenue(java.math.BigDecimal.ZERO)
                        .build());
            }

            for (Orders o : orders) {
                int day = o.getCreatedAt().getDayOfMonth();
                RevenueReportResponse report = dayMap.get(day);
                if (report != null) {
                    report.setTotalOrders(report.getTotalOrders() + 1);
                    java.math.BigDecimal amount = o.getTotalAmount() != null ? o.getTotalAmount() : java.math.BigDecimal.ZERO;
                    report.setTotalRevenue(report.getTotalRevenue().add(amount));
                }
            }

            return dayMap.entrySet().stream()
                    .sorted(Map.Entry.comparingByKey())
                    .map(Map.Entry::getValue)
                    .toList();
        } else {
            Map<Integer, RevenueReportResponse> monthMap = new HashMap<>();
            for (int m = 1; m <= 12; m++) {
                monthMap.put(m, RevenueReportResponse.builder()
                        .label(String.format("Tháng %02d", m))
                        .totalOrders(0L)
                        .totalRevenue(java.math.BigDecimal.ZERO)
                        .build());
            }

            for (Orders o : orders) {
                int m = o.getCreatedAt().getMonthValue();
                RevenueReportResponse report = monthMap.get(m);
                if (report != null) {
                    report.setTotalOrders(report.getTotalOrders() + 1);
                    java.math.BigDecimal amount = o.getTotalAmount() != null ? o.getTotalAmount() : java.math.BigDecimal.ZERO;
                    report.setTotalRevenue(report.getTotalRevenue().add(amount));
                }
            }

            return monthMap.entrySet().stream()
                    .sorted(Map.Entry.comparingByKey())
                    .map(Map.Entry::getValue)
                    .toList();
        }
    }

    @Override
    public List<BrandSalesResponse> getBrandSalesReport(Integer year, Integer month) {
        if (year == null) {
            year = java.time.LocalDate.now().getYear();
        }

        LocalDateTime start;
        LocalDateTime end;
        if (month != null) {
            java.time.LocalDate date = java.time.LocalDate.of(year, month, 1);
            start = date.atStartOfDay();
            end = date.withDayOfMonth(date.lengthOfMonth()).atTime(23, 59, 59);
        } else {
            start = LocalDateTime.of(year, 1, 1, 0, 0, 0);
            end = LocalDateTime.of(year, 12, 31, 23, 59, 59);
        }

        List<Orders> orders = ordersRepository.findByStatusInAndCreatedAtBetween(
                List.of(OrdersStatus.PAID, OrdersStatus.DELIVERED),
                start,
                end
        );

        // Local cache for car details to optimize network calls
        Map<String, com.tlaq.ordering_service.dto.response.CarResponse> carCache = new HashMap<>();
        Map<String, BrandSalesResponse> brandMap = new HashMap<>();

        for (Orders o : orders) {
            if (o.getOrderItem() != null) {
                com.tlaq.ordering_service.entity.OrdersDetails item = o.getOrderItem();
                String carId = item.getCarId();
                com.tlaq.ordering_service.dto.response.CarResponse car = carCache.computeIfAbsent(carId, id -> {
                    try {
                        var carRes = catalogClient.getProductById(id);
                        if (carRes != null) {
                            return carRes.getResult();
                        }
                    } catch (Exception e) {
                        log.error("Failed to fetch car details for carId: {}", id, e);
                    }
                    return null;
                });

                String brandName = "Khác";
                String logoUrlVal = "";
                if (car != null && car.getCarModel() != null && car.getCarModel().getCarBranch() != null) {
                    brandName = car.getCarModel().getCarBranch().getName();
                    logoUrlVal = car.getCarModel().getCarBranch().getImageBranch();
                }
                final String logoUrl = logoUrlVal;

                BrandSalesResponse brandSales = brandMap.computeIfAbsent(brandName, b -> 
                    BrandSalesResponse.builder()
                            .brandName(b)
                            .quantitySold(0L)
                            .totalRevenue(java.math.BigDecimal.ZERO)
                            .logoUrl(logoUrl)
                            .build()
                );

                brandSales.setQuantitySold(brandSales.getQuantitySold() + 1);
                java.math.BigDecimal itemRevenue = item.getUnitPrice(); // quantity is 1
                brandSales.setTotalRevenue(brandSales.getTotalRevenue().add(itemRevenue));
            }
        }

        return brandMap.values().stream()
                .sorted((b1, b2) -> b2.getTotalRevenue().compareTo(b1.getTotalRevenue()))
                .toList();
    }
}
