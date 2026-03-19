package com.tlaq.ordering_service.service.impl;

import com.tlaq.ordering_service.config.RabbitMQConfig;
import com.tlaq.ordering_service.dto.PageResponse;
import com.tlaq.ordering_service.dto.message.InventoryUpdateMessage;
import com.tlaq.ordering_service.dto.request.OrdersDetailsRequest;
import com.tlaq.ordering_service.dto.request.OrdersRequest;
import com.tlaq.ordering_service.dto.response.CarResponse;
import com.tlaq.ordering_service.dto.response.InventoryResponse;
import com.tlaq.ordering_service.dto.response.OrdersHistoryResponse;
import com.tlaq.ordering_service.dto.response.OrdersResponse;
import com.tlaq.ordering_service.entity.Orders;
import com.tlaq.ordering_service.entity.OrdersDetails;
import com.tlaq.ordering_service.entity.OrdersHistory;
import com.tlaq.ordering_service.entity.enums.OrdersStatus;
import com.tlaq.ordering_service.entity.enums.OrdersType;
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
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
    RabbitTemplate rabbitTemplate;

    @Override
    public Boolean checkOrderId(String orderId) {
        boolean exists = ordersRepository.existsById(orderId);

        if (exists) {
            log.info("Order ID hợp lệ: {}", orderId);
        } else {
            log.warn("Order ID không tồn tại trong hệ thống thanh toán: {}", orderId);
        }

        return exists;
    }

    @Override
    public OrdersResponse getOrderById(String id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userKeycloak = authentication.getName();

        // 1. Tìm đơn hàng trước
        Orders order = ordersRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_IS_EMPTY));

        // 2. Kiểm tra điều kiện truy cập:
        // Điều kiện A: Là STAFF
        boolean isStaff = checkRoleStaff();

        // Điều kiện B: Là chủ sở hữu đơn hàng
        String userId = identityClient.getProfileByUserKeycloakId(userKeycloak).getResult().getId();
        boolean isOwner = order.getUserId().equals(userId);

        // 3. Nếu KHÔNG PHẢI STAFF và CŨNG KHÔNG PHẢI CHỦ ĐƠN -> Chặn
        if (!isStaff && !isOwner) {
            log.warn("Cảnh báo: Người dùng {} (không phải STAFF) cố tình truy cập đơn hàng {} của người dùng {}",
                    userKeycloak, id, order.getUserId());
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        return ordersMapper.toOrdersResponse(order);
    }


    @Override
    @Transactional
    public OrdersResponse createOrder(OrdersRequest request) {
        // 1. Xác thực người dùng
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userKeyCloakId = authentication.getName();

        if (request.getOrderItems() == null || request.getOrderItems().isEmpty()) {
            throw new AppException(ErrorCode.ORDER_IS_EMPTY);
        }

        var profileRes = identityClient.getProfileByUserKeycloakId(userKeyCloakId).getResult();
        if (profileRes == null) throw new AppException(ErrorCode.USER_NOT_EXISTED);
        String profileId = profileRes.getId();

        // 2. Khởi tạo Orders (chỉ map note, các trường còn lại set thủ công)
        Orders order = ordersMapper.toOrdersEntity(request);
        order.setUserId(profileId);
        order.setStatus(OrdersStatus.PENDING);
        order.setType(checkRoleStaff() ? OrdersType.PURCHASE : OrdersType.DEPOSIT);

        // 3. Xử lý từng item — validate + tính giá
        BigDecimal totalBaseAmount      = BigDecimal.ZERO;
        BigDecimal totalTaxAmount       = BigDecimal.ZERO;
        BigDecimal totalPlateFeeAmount  = BigDecimal.ZERO;
        BigDecimal totalInsuranceAmount = BigDecimal.ZERO;
        BigDecimal totalOrderAmount     = BigDecimal.ZERO;

        List<OrdersDetails> detailsEntities = new ArrayList<>();

        for (OrdersDetailsRequest itemDto : request.getOrderItems()) {
            // 3a. Validate xe tồn tại
            CarResponse carDetail = catalogClient.getProductById(itemDto.getCarId()).getResult();
            if (carDetail == null) throw new AppException(ErrorCode.CAR_NOT_FOUND);

            // 3b. Validate tồn kho
            Boolean inStock = catalogClient.checkInventory(itemDto.getCarId(), itemDto.getQuantity()).getResult();
            if (!Boolean.TRUE.equals(inStock)) throw new AppException(ErrorCode.QUANTITY_NOT_ENOUGH);

            // 3c. Tính giá
            BigDecimal qty             = BigDecimal.valueOf(itemDto.getQuantity());
            BigDecimal basePrice       = carDetail.getPrice();
            BigDecimal registrationTax = calculateRegistrationTax(basePrice, itemDto.getAddress(), carDetail.getTechnicalSpec().getFuelType());
            BigDecimal plateFee        = calculatePlateFee(itemDto.getAddress());
            BigDecimal fixedFees       = new BigDecimal("2500000"); // phí đăng kiểm

            // 3d. Cộng dồn vào tổng đơn hàng
            totalBaseAmount      = totalBaseAmount.add(basePrice.multiply(qty));
            totalTaxAmount       = totalTaxAmount.add(registrationTax.multiply(qty));
            totalPlateFeeAmount  = totalPlateFeeAmount.add(plateFee.multiply(qty));
            totalInsuranceAmount = totalInsuranceAmount.add(fixedFees.multiply(qty));

            BigDecimal unitRollingPrice = basePrice.add(registrationTax).add(plateFee).add(fixedFees);
            totalOrderAmount = totalOrderAmount.add(unitRollingPrice.multiply(qty));

            // 3e. Build OrdersDetails — không set totalAmount (là @Transient, tự tính)
            detailsEntities.add(OrdersDetails.builder()
                    .carId(itemDto.getCarId())
                    .fullName(itemDto.getFullName())
                    .phoneNumber(itemDto.getPhoneNumber())
                    .address(itemDto.getAddress())
                    .cccd(itemDto.getCccd())
                    .dob(itemDto.getDob())
                    .quantity(itemDto.getQuantity())
                    .unitPrice(unitRollingPrice) // giá lăn bánh/chiếc
                    .order(order)
                    .build());
        }

        // 4. Gán tổng vào order
        order.setOrderItems(detailsEntities);
        order.setBaseAmount(totalBaseAmount);
        order.setTaxAmount(totalTaxAmount);
        order.setPlateFeeAmount(totalPlateFeeAmount);
        order.setInsuranceAmount(totalInsuranceAmount);
        order.setTotalAmount(totalOrderAmount);

        // 5. Lưu và ghi lịch sử
        Orders savedOrder = ordersRepository.save(order);
        saveHistory(savedOrder, OrdersStatus.PENDING, "Đơn hàng đã được khởi tạo.", profileId);

        Map<String, Object> msg = new HashMap<>();
        msg.put("orderId", savedOrder.getId());
        msg.put("rollback", false);
        List<Map<String, Object>> items = savedOrder.getOrderItems().stream().map(item -> {
            Map<String, Object> i = new HashMap<>();
            i.put("carId", item.getCarId());
            i.put("quantity", item.getQuantity());
            return i;
        }).toList();
        msg.put("items", items);

// Gửi SAU KHI transaction commit
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                log.info("Gửi lệnh trừ kho - OrderId: {}", savedOrder.getId());
                rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, RabbitMQConfig.INVENTORY_ROUTING_KEY, msg);

                log.info("Gửi lệnh hẹn giờ 3 phút - OrderId: {}", savedOrder.getId());
                rabbitTemplate.convertAndSend(RabbitMQConfig.ORDER_TIMEOUT_EXCHANGE, RabbitMQConfig.ORDER_TIMEOUT_RK, msg);
            }
        });

        return ordersMapper.toOrdersResponse(savedOrder);
    }


    @Override
    public List<OrdersResponse> getMyOrders(String userKeyCloakId) {
        String profileId = identityClient.getProfileByUserKeycloakId(userKeyCloakId).getResult().getId();
        return ordersRepository.findByUserIdOrderByCreatedAtDesc(profileId).stream()
                .map(ordersMapper::toOrdersResponse)
                .collect(Collectors.toList());
    }


    @Override
    public void confirmDelivery(String orderId) {
        Orders order = ordersRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (!order.getStatus().equals(OrdersStatus.PAID)) {
            throw new AppException(ErrorCode.ORDER_NOT_PAID_YET);
        }

        order.setStatus(OrdersStatus.WAITING_FOR_PAY);
        ordersRepository.save(order);
    }

    @Override
    @Transactional
    public void cancelOrder(String orderId, String reason) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userKeyCloakId = authentication.getName();

        // 2. Tìm đơn hàng
        Orders order = ordersRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        var profile = identityClient.getProfileByUserKeycloakId(userKeyCloakId).getResult();
        if (!order.getUserId().equals(profile.getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // 4. Kiểm tra trạng thái (Chỉ được hủy khi còn PENDING)
        if (!order.getStatus().equals(OrdersStatus.PENDING)) {
            throw new AppException(ErrorCode.CANNOT_CANCEL_ORDER);
        }

        // 5. Cập nhật trạng thái và lưu lịch sử
        order.setStatus(OrdersStatus.CANCELLED);
        order.setNote("Khách hàng hủy: " + reason);
        ordersRepository.save(order);

        saveHistory(order, OrdersStatus.CANCELLED, "Khách hàng chủ động hủy đơn. Lý do: " + reason, profile.getId());
    }

    private BigDecimal calculateRegistrationTax(BigDecimal price, String address, String fuelType) {
        if ("ELECTRIC".equalsIgnoreCase(fuelType)) return BigDecimal.ZERO;
        double rate = (address.contains("Hà Nội") || address.contains("Hồ Chí Minh")) ? 0.12 : 0.10;
        return price.multiply(BigDecimal.valueOf(rate));
    }

    private BigDecimal calculatePlateFee(String address) {
        return (address.contains("Hà Nội") || address.contains("Hồ Chí Minh"))
                ? new BigDecimal("20000000") : new BigDecimal("1000000");
    }

    private void saveHistory(Orders order, OrdersStatus status, String note, String actorId) {
        OrdersHistory history = OrdersHistory.builder()
                .order(order)
                .status(status)
                .note(note)
                .updatedBy(actorId)
                .build();
        ordersHistoryRepository.save(history);
    }

    private boolean checkRoleStaff() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_STAFF"));
    }
}