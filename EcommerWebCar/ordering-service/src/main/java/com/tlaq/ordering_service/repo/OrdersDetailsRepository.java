package com.tlaq.ordering_service.repo;

import com.tlaq.ordering_service.entity.OrdersDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrdersDetailsRepository extends JpaRepository<OrdersDetails, Long> {

    // Tìm chi tiết đơn hàng theo ID xe (Hữu ích khi muốn kiểm tra xe này đã được bán chưa) [cite: 2026-02-25]
    Optional<OrdersDetails> findByCarId(String carId);

    // Lấy tất cả chi tiết thuộc về một đơn hàng chính [cite: 2026-02-25]
    // Lưu ý: Trong Entity OrdersDetails bạn cần bổ sung quan hệ @ManyToOne với Orders để dùng hàm này
    // List<OrdersDetails> findByOrderId(String orderId);
}