package com.tlaq.ordering_service.service.impl;

import com.tlaq.ordering_service.dto.PageResponse;
import com.tlaq.ordering_service.dto.request.OrdersDetailsRequest;
import com.tlaq.ordering_service.dto.request.OrdersRequest;
import com.tlaq.ordering_service.dto.response.OrdersHistoryResponse;
import com.tlaq.ordering_service.dto.response.OrdersResponse;
import com.tlaq.ordering_service.entity.Orders;
import com.tlaq.ordering_service.entity.OrdersDetails;
import com.tlaq.ordering_service.entity.OrdersHistory;
import com.tlaq.ordering_service.entity.enums.OrdersStatus;
import com.tlaq.ordering_service.exceptions.AppException;
import com.tlaq.ordering_service.exceptions.ErrorCode;
import com.tlaq.ordering_service.mapper.OrdersMapper;
import com.tlaq.ordering_service.repo.OrdersHistoryRepository;
import com.tlaq.ordering_service.repo.OrdersRepository;
import com.tlaq.ordering_service.repo.httpClient.IdentityClient;
import com.tlaq.ordering_service.repo.httpClient.CatalogClient;
import com.tlaq.ordering_service.service.OrdersService;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
@Service
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrdersServiceImpl implements OrdersService {
    OrdersRepository ordersRepository;
    OrdersHistoryRepository ordersHistoryRepository;
    OrdersMapper ordersMapper;
    CatalogClient catalogClient;
    IdentityClient identityClient;

    @Override
    public OrdersResponse getOrderById(String id) {
        Orders order = ordersRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_IS_EMPTY));
        return ordersMapper.toOrdersResponse(order);
    }

    @Override
    @Transactional
    public OrdersResponse createOrder(OrdersRequest request, String userKeyCloakId) {
        if (request.getOrderItems() == null || request.getOrderItems().isEmpty()) {
            throw new AppException(ErrorCode.ORDER_IS_EMPTY);
        }

        // 1. Kiểm tra tồn kho (Lấy xe đầu tiên)
        OrdersDetailsRequest firstItem = request.getOrderItems().get(0);
        Boolean isAvailable = catalogClient.checkInventory(firstItem.getCarId(), firstItem.getQuantity()).getResult();
        if (Boolean.FALSE.equals(isAvailable)) {
            throw new AppException(ErrorCode.QUANTITY_NOT_ENOUGH);
        }

        // 2. Lấy Profile ID từ Identity Service
        var profileRes = identityClient.getProfile(userKeyCloakId);
        if (profileRes.getResult() == null) throw new AppException(ErrorCode.USER_NOT_EXISTED);
        String profileId = profileRes.getResult().getId();

        // 3. Khởi tạo đơn hàng
        Orders order = ordersMapper.toOrdersEntity(request);
        order.setUserId(profileId);
        order.setStatus(OrdersStatus.PENDING);

        List<OrdersDetails> detailsEntities = new ArrayList<>();
        BigDecimal totalOrderAmount = BigDecimal.ZERO;

        // 4. Xử lý từng Item và lấy giá từ Catalog Service
        for (OrdersDetailsRequest itemDto : request.getOrderItems()) {
            BigDecimal currentPrice = catalogClient.getCarPrice(itemDto.getCarId()).getResult();

            OrdersDetails detail = OrdersDetails.builder()
                    .carId(itemDto.getCarId())
                    .fullName(itemDto.getFullName())
                    .phoneNumber(itemDto.getPhoneNumber())
                    .address(itemDto.getAddress())
                    .cccd(itemDto.getCccd())
                    .dob(itemDto.getDob())
                    .quantity(itemDto.getQuantity())
                    .unitPrice(currentPrice)
                    .totalAmount(currentPrice.multiply(BigDecimal.valueOf(itemDto.getQuantity())))
                    .order(order)
                    .build();

            detailsEntities.add(detail);
            totalOrderAmount = totalOrderAmount.add(detail.getTotalAmount());
        }

        order.setOrderItems(detailsEntities);
        order.setTotalAmount(totalOrderAmount);

        // 5. Lưu và ghi log lịch sử
        Orders savedOrder = ordersRepository.save(order);
        saveHistory(savedOrder, OrdersStatus.PENDING, "Đơn hàng đã được khởi tạo bởi khách hàng.", profileId);

        return ordersMapper.toOrdersResponse(savedOrder);
    }

    @Override
    @Transactional
    public void markSuccess(String id) {
        Orders order = ordersRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_IS_EMPTY));

        order.setStatus(OrdersStatus.PAID);
        ordersRepository.save(order);

        saveHistory(order, OrdersStatus.PAID, "Hệ thống: Thanh toán thành công.", "SYSTEM_PAYMENT");
    }

    @Override
    @Transactional
    public void markFail(String id) {
        Orders order = ordersRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_IS_EMPTY));

        order.setStatus(OrdersStatus.CANCELLED);
        ordersRepository.save(order);

        saveHistory(order, OrdersStatus.CANCELLED, "Hệ thống: Giao dịch thất bại hoặc bị hủy.", "SYSTEM_PAYMENT");
    }

    @Override
    public List<OrdersResponse> getMyOrders(String userKeyCloakId) {
        String profileId = identityClient.getProfile(userKeyCloakId).getResult().getId();
        return ordersRepository.findByUserIdOrderByCreatedAtDesc(profileId).stream()
                .map(ordersMapper::toOrdersResponse)
                .collect(Collectors.toList());
    }

    @Override
    public PageResponse<OrdersResponse> getAllOrders(int page, int size, String status) {
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        Pageable pageable = PageRequest.of(page - 1, size, sort);

        // Nếu có status thì lọc theo status, không thì lấy hết
        var pageData = (status != null)
                ? ordersRepository.findByStatus(OrdersStatus.valueOf(status), pageable)
                : ordersRepository.findAll(pageable);

        return PageResponse.<OrdersResponse>builder()
                .currentPage(page)
                .totalPages(pageData.getTotalPages())
                .totalElements(pageData.getTotalElements())
                .data(pageData.getContent().stream().map(ordersMapper::toOrdersResponse).toList())
                .build();
    }

    @Override
    @Transactional
    public OrdersResponse updateStatus(String orderId, OrdersStatus newStatus, String note) {
        if (!checkRoleStaff()) throw new AppException(ErrorCode.UNAUTHORIZED);

        Orders order = ordersRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_IS_EMPTY));

        order.setStatus(newStatus);
        Orders savedOrder = ordersRepository.save(order);

        // Lấy tên staff thực hiện
        String staffName = SecurityContextHolder.getContext().getAuthentication().getName();
        saveHistory(savedOrder, newStatus, "Nhân viên showroom: " + note, staffName);

        return ordersMapper.toOrdersResponse(savedOrder);
    }

    @Override
    public List<OrdersHistoryResponse> getOrderTimeline(String orderId) {
        return ordersHistoryRepository.findByOrderIdOrderByCreatedAtAsc(orderId).stream()
                .map(ordersMapper::toOrdersHistoryResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void confirmDelivery(String orderId) {
        // 1. Tìm đơn hàng
        Orders order = ordersRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        // 2. Kiểm tra: Chỉ cho phép giao xe khi đã thanh toán (PAID) [cite: 2026-03-03]
        if (!order.getStatus().equals(OrdersStatus.PAID)) {
            throw new AppException(ErrorCode.ORDER_NOT_PAID_YET);
        }

        // 3. Cập nhật trạng thái sang DELIVERED (Đã giao)
        order.setStatus(OrdersStatus.COMPLETED);
        ordersRepository.save(order);

        // 4. Lưu lịch sử Timeline cho khách theo dõi [cite: 2026-03-03]
        // Trong hàm markSuccess
        saveHistory(order, OrdersStatus.PAID, "Hệ thống đã xác nhận thanh toán cọc qua VNPAY.", "SYSTEM");

        log.info("Order {} has been delivered successfully.", orderId);
    }

    // --- Helper Methods ---

    private void saveHistory(Orders order, OrdersStatus status, String note, String updatedBy) {
        OrdersHistory history = OrdersHistory.builder()
                .order(order)
                .status(status)
                .note(note)
                .updatedBy(updatedBy)
                .build();
        ordersHistoryRepository.save(history);
    }

    private boolean checkRoleStaff() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_STAFF"));
    }
}