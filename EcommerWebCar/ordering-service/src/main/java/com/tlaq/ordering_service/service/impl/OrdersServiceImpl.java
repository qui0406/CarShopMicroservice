package com.tlaq.ordering_service.service.impl;

import com.tlaq.ordering_service.config.RabbitMQConfig;
import com.tlaq.event.dto.NotificationEvent;
import com.tlaq.ordering_service.dto.PageResponse;
import com.tlaq.ordering_service.dto.message.InventoryUpdateMessage;
import com.tlaq.ordering_service.dto.message.OrderInventoryMessage;
import com.tlaq.ordering_service.dto.request.CarBatchItemRequest;
import com.tlaq.ordering_service.dto.request.OrdersDetailsRequest;
import com.tlaq.ordering_service.dto.request.OrdersRequest;
import com.tlaq.ordering_service.dto.response.CarBatchResponse;
import com.tlaq.ordering_service.dto.response.CarResponse;
import com.tlaq.ordering_service.dto.response.OrdersHistoryResponse;
import com.tlaq.ordering_service.dto.response.OrdersResponse;
import com.tlaq.ordering_service.dto.response.UserProfileResponse;
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
import com.tlaq.ordering_service.service.FeeConfigService;
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
    FeeConfigService feeConfigService;

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

        OrdersResponse response = ordersMapper.toOrdersResponse(order);
        if (response != null && response.getTotalAmount() != null) {
            response.setDepositAmount(response.getTotalAmount().multiply(new BigDecimal("0.01")));
        }
        return response;
    }


    @Override
    @Transactional
    public OrdersResponse createOrder(OrdersRequest request) {
        // 1. Lấy thông tin người dùng
        String userKeyCloakId = getCurrentUserKeycloakId();
        var profileRes = identityClient.getProfileByUserKeycloakId(userKeyCloakId).getResult();
        if (profileRes == null) throw new AppException(ErrorCode.USER_NOT_EXISTED);
        String profileId = profileRes.getId();

        // 2. Guard: danh sách sản phẩm không được rỗng
        if (request.getOrderItems() == null || request.getOrderItems().isEmpty()) {
            throw new AppException(ErrorCode.ORDER_IS_EMPTY);
        }

        // 3. GIẢI QUYẾT N+1: Batch validate thông tin xe và tồn kho trong 1 lần gọi duy nhất
        List<CarBatchItemRequest> batchRequests = request.getOrderItems().stream()
                .map(item -> CarBatchItemRequest.builder()
                        .carId(item.getCarId())
                        .quantity(item.getQuantity())
                        .build())
                .toList();

        var batchRes = catalogClient.validateBatch(batchRequests).getResult();

        if (batchRes == null || batchRes.size() != request.getOrderItems().size()) {
            throw new AppException(ErrorCode.CAR_NOT_FOUND);
        }

        // Tạo Map để lookup nhanh kết quả validate theo carId
        Map<String, CarBatchResponse> validationMap = batchRes.stream()
                .filter(res -> {
                    if (res == null || res.getCarDetail() == null) {
                        log.error("⚠️ Catalog Service trả về thông tin xe bị NULL: {}", res);
                        return false;
                    }
                    return true;
                })
                .collect(Collectors.toMap(res -> res.getCarDetail().getId(), res -> res));

        // 4. Khởi tạo Orders
        Orders order = ordersMapper.toOrdersEntity(request);
        order.setUserId(profileId);
        order.setStatus(OrdersStatus.PENDING);
        order.setType(checkRoleStaff() ? OrdersType.PURCHASE : OrdersType.DEPOSIT);

        // 5. Xử lý từng item: tính phí dựa trên dữ liệu đã batch validate
        OrderTotals totals = new OrderTotals();
        List<OrdersDetails> detailsEntities = new ArrayList<>();

        for (OrdersDetailsRequest itemDto : request.getOrderItems()) {
            CarBatchResponse validatedData = validationMap.get(itemDto.getCarId());
            detailsEntities.add(processItem(itemDto, order, totals, validatedData));
        }

        // 6. Gán tổng vào order
        order.setOrderItems(detailsEntities);
        order.setBaseAmount(totals.baseAmount);
        order.setTaxAmount(totals.taxAmount);
        order.setPlateFeeAmount(totals.plateFeeAmount);
        order.setInsuranceAmount(totals.insuranceAmount);
        order.setTotalAmount(totals.totalAmount);

        // 7. Lưu DB + ghi lịch sử
        Orders savedOrder = ordersRepository.save(order);
        saveHistory(savedOrder, OrdersStatus.PENDING, "\u0110ơn hàng đã được khởi tạo.", profileId);

        // 8. Gửi message SAU KHI transaction commit thành công
        OrderInventoryMessage inventoryMsg = buildInventoryMessage(savedOrder, false);
        schedulePostCommitMessages(savedOrder, inventoryMsg, profileId, profileRes.getEmail());

        OrdersResponse response = ordersMapper.toOrdersResponse(savedOrder);
        // Tính tiền cọc (1% tổng giá trị) để trả về cho frontend
        if (response != null && response.getTotalAmount() != null) {
            response.setDepositAmount(response.getTotalAmount().multiply(new BigDecimal("0.01")));
        }

        return response;
    }

    // -----------------------------------------------------------------------
    // Private helpers for createOrder
    // -----------------------------------------------------------------------

    /**
     * Xử lý một item trong đơn hàng:
     * Sử dụng validatedData từ batch call để tính phí, cộng dồn vào totals.
     */
    private OrdersDetails processItem(OrdersDetailsRequest itemDto, Orders order, OrderTotals totals, CarBatchResponse validatedData) {
        if (validatedData == null) throw new AppException(ErrorCode.CAR_NOT_FOUND);

        // Validate tồn kho (đã được check ở catalog-service trong batch-validate)
        if (!validatedData.isInStock()) throw new AppException(ErrorCode.QUANTITY_NOT_ENOUGH);

        CarResponse car = validatedData.getCarDetail();

        // Tính các khoản phí
        String region       = feeConfigService.resolveRegion(itemDto.getAddress());
        // null-safe: technicalSpec có thể null nếu catalog trả về thiếu data
        String fuelType     = (car.getFuelType() != null) ? car.getFuelType() : "GASOLINE";
        BigDecimal qty      = BigDecimal.valueOf(itemDto.getQuantity());
        BigDecimal base     = car.getPrice();
        BigDecimal taxRate  = feeConfigService.getRegistrationTaxRate(region, fuelType);
        BigDecimal tax      = base.multiply(taxRate);
        BigDecimal plate    = feeConfigService.getPlateFee(region);
        BigDecimal inspect  = feeConfigService.getInspectionFee();
        BigDecimal rolling  = base.add(tax).add(plate).add(inspect); // giá lăn bánh/chiếc

        // Cộng dồn vào tổng đơn
        totals.baseAmount     = totals.baseAmount.add(base.multiply(qty));
        totals.taxAmount      = totals.taxAmount.add(tax.multiply(qty));
        totals.plateFeeAmount = totals.plateFeeAmount.add(plate.multiply(qty));
        totals.insuranceAmount = totals.insuranceAmount.add(inspect.multiply(qty));
        totals.totalAmount    = totals.totalAmount.add(rolling.multiply(qty));

        return OrdersDetails.builder()
                .carId(itemDto.getCarId())
                .fullName(itemDto.getFullName())
                .phoneNumber(itemDto.getPhoneNumber())
                .address(itemDto.getAddress())
                .cccd(itemDto.getCccd())
                .dob(itemDto.getDob())
                .quantity(itemDto.getQuantity())
                .unitPrice(rolling)
                .order(order)
                .build();
    }

    /** Build message trừ/hoàn kho type-safe (thay HashMap thô) */
    private OrderInventoryMessage buildInventoryMessage(Orders order, boolean rollback) {
        List<InventoryUpdateMessage> items = order.getOrderItems().stream()
                .map(d -> InventoryUpdateMessage.builder()
                        .carId(d.getCarId())
                        .quantity(d.getQuantity())
                        .build())
                .toList();
        return OrderInventoryMessage.builder()
                .orderId(order.getId())
                .rollback(rollback)
                .items(items)
                .build();
    }

    /**
     * Đăng ký gửi các message sau khi transaction commit.
     * Tách ra method riêng để afterCommit() không quá rối.
     */
    private void schedulePostCommitMessages(
            Orders savedOrder,
            OrderInventoryMessage inventoryMsg,
            String profileId,
            String userEmail) {

        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                sendInventoryMessages(savedOrder.getId(), inventoryMsg);
                sendOrderCreatedEmail(savedOrder, profileId, userEmail);
            }
        });
    }

    /** Gửi lệnh trừ kho + bộ đếm timeout */
    private void sendInventoryMessages(String orderId, OrderInventoryMessage msg) {
        log.info("Gửi lệnh trừ kho - OrderId: {}", orderId);
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, RabbitMQConfig.INVENTORY_ROUTING_KEY, msg);

        log.info("Gửi lệnh hẹn giờ 3 phút - OrderId: {}", orderId);
        rabbitTemplate.convertAndSend(RabbitMQConfig.ORDER_TIMEOUT_EXCHANGE, RabbitMQConfig.ORDER_TIMEOUT_RK, msg);
    }

    /** Gửi email xác nhận tạo đơn (bỏ qua nếu không có email) */
    private void sendOrderCreatedEmail(Orders savedOrder, String profileId, String userEmail) {
        if (userEmail == null || userEmail.isBlank()) {
            log.warn("⚠️ Không có email để gửi xác nhận đơn - OrderId: {}", savedOrder.getId());
            return;
        }
        try {
            Map<String, Object> notiParam = Map.of(
                    "orderId",     savedOrder.getId(),
                    "totalAmount", savedOrder.getTotalAmount()
            );
            NotificationEvent event = NotificationEvent.builder()
                    .type("ORDER_CREATED")
                    .channel("EMAIL")
                    .recipientId(profileId)
                    .recipientEmail(userEmail)
                    .subject("Xác nhận đặt xe thành công - Mã đơn: " + savedOrder.getId())
                    .body(String.format(
                            "Cảm ơn bạn đã đặt xe tại cửa hàng chúng tôi. " +
                            "Mã đơn hàng: %s. " +
                            "Tổng giá trị: %s VN\u0110. " +
                            "Chúng tôi sẽ liên hệ xác nhận trong thời gian sớm nhất.",
                            savedOrder.getId(), savedOrder.getTotalAmount()))
                    .param(notiParam)
                    .build();
            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.NOTIFICATION_EXCHANGE,
                    RabbitMQConfig.NOTIFICATION_ROUTING_KEY,
                    event);
            log.info("📧 Gửi Email xác nhận đặt xe - OrderId: {}", savedOrder.getId());
        } catch (Exception e) {
            log.error("❌ Lỗi gửi notification tạo đơn hàng - OrderId: {}, error: {}",
                    savedOrder.getId(), e.getMessage());
        }
    }

    /** Value object gữ tổng các khoản phí để cộng dồn trong vòng lặp */
    private static class OrderTotals {
        BigDecimal baseAmount      = BigDecimal.ZERO;
        BigDecimal taxAmount       = BigDecimal.ZERO;
        BigDecimal plateFeeAmount  = BigDecimal.ZERO;
        BigDecimal insuranceAmount = BigDecimal.ZERO;
        BigDecimal totalAmount     = BigDecimal.ZERO;
    }

    /** Lấy KeycloakId của người dùng đang đăng nhập */
    private String getCurrentUserKeycloakId() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }


    @Override
    public List<OrdersResponse> getMyOrders(String userKeyCloakId) {
        String profileId = identityClient.getProfileByUserKeycloakId(userKeyCloakId).getResult().getId();
        return ordersRepository.findByUserIdOrderByCreatedAtDesc(profileId).stream()
                .map(order -> {
                    OrdersResponse res = ordersMapper.toOrdersResponse(order);
                    if (res.getTotalAmount() != null) {
                        res.setDepositAmount(res.getTotalAmount().multiply(new BigDecimal("0.01")));
                    }
                    return res;
                })
                .collect(Collectors.toList());
    }


    @Override
    public void confirmDelivery(String orderId) {
        Orders order = ordersRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (!order.getStatus().equals(OrdersStatus.PAID)) {
            throw new AppException(ErrorCode.ORDER_NOT_PAID_YET);
        }

        order.setStatus(OrdersStatus.DELIVERED);
        ordersRepository.save(order);
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userKeyCloakId = authentication.getName();
        var profile = identityClient.getProfileByUserKeycloakId(userKeyCloakId).getResult();
        saveHistory(order, OrdersStatus.DELIVERED, "Đơn hàng đã được giao thành công.", profile.getId());

        // 📧 Gửi Email thông báo giao hàng thành công cho chủ đơn
        try {
            var ownerProfile = identityClient.getProfileById(order.getUserId()).getResult();
            if (ownerProfile != null && ownerProfile.getEmail() != null) {
                Map<String, Object> notiParam = new HashMap<>();
                notiParam.put("orderId", orderId);

                NotificationEvent deliveredEvent = NotificationEvent.builder()
                        .type("ORDER_DELIVERED")
                        .channel("EMAIL")
                        .recipientId(order.getUserId())
                        .recipientEmail(ownerProfile.getEmail())
                        .subject("Đơn hàng đã được giao thành công - Mã đơn: " + orderId)
                        .body("Đơn hàng " + orderId + " của bạn đã được giao thành công. " +
                              "Cảm ơn bạn đã tin tưởng và mua sắm tại cửa hàng chúng tôi!")
                        .param(notiParam)
                        .build();

                rabbitTemplate.convertAndSend(
                        RabbitMQConfig.NOTIFICATION_EXCHANGE,
                        RabbitMQConfig.NOTIFICATION_ROUTING_KEY,
                        deliveredEvent
                );
                log.info("📧 Gửi Email giao hàng thành công - OrderId: {}", orderId);
            }
        } catch (Exception e) {
            log.error("Lỗi gửi notification giao hàng: {}", e.getMessage());
        }
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

        // --- CHUẨN BỊ DỮ LIỆU MESSAGE ---
        // 1. Dữ liệu hoàn kho
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

        // 2. Dữ liệu gửi Email
        NotificationEvent cancelledEvent = null;
        if (profile.getEmail() != null) {
            Map<String, Object> notiParam = new HashMap<>();
            notiParam.put("orderId", orderId);
            notiParam.put("reason", reason);

            cancelledEvent = NotificationEvent.builder()
                    .type("ORDER_CANCELLED")
                    .channel("EMAIL")
                    .recipientId(profile.getId())
                    .recipientEmail(profile.getEmail())
                    .subject("Đơn hàng đã bị hủy - Mã đơn: " + orderId)
                    .body("Đơn hàng " + orderId + " của bạn đã được hủy thành công. " +
                            "Lý do: " + reason + ". Nếu bạn cần hỗ trợ, vui lòng liên hệ cửa hàng.")
                    .param(notiParam)
                    .build();
        }

        // Cần gán vào biến final (hoặc effectively final) để dùng bên trong inner class
        final NotificationEvent finalCancelledEvent = cancelledEvent;

        // 6. ĐĂNG KÝ GỬI MESSAGE SAU KHI TRANSACTION COMMIT THÀNH CÔNG
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                // Chỉ chạy vào đây khi Database đã lưu xong hoàn toàn trạng thái CANCELLED
                log.info("Gửi lệnh hoàn kho (khách hủy) - OrderId: {}", order.getId());
                rabbitTemplate.convertAndSend(
                        RabbitMQConfig.EXCHANGE,
                        RabbitMQConfig.INVENTORY_ROLLBACK_RK,
                        rollbackMsg
                );

                // 📧 Gửi Email xác nhận hủy đơn cho khách
                if (finalCancelledEvent != null) {
                    try {
                        rabbitTemplate.convertAndSend(
                                RabbitMQConfig.NOTIFICATION_EXCHANGE,
                                RabbitMQConfig.NOTIFICATION_ROUTING_KEY,
                                finalCancelledEvent
                        );
                        log.info("📧 Gửi Email hủy đơn - OrderId: {}", order.getId());
                    } catch (Exception e) {
                        log.error("Lỗi gửi notification hủy đơn: {}", e.getMessage());
                    }
                }
            }
        });
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