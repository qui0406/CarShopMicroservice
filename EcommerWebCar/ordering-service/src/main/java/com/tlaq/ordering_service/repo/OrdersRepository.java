package com.tlaq.ordering_service.repo;

import com.tlaq.ordering_service.entity.Orders;
import com.tlaq.ordering_service.entity.enums.OrdersStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrdersRepository extends JpaRepository<Orders, String>, JpaSpecificationExecutor<Orders> {

    // Lấy danh sách đơn hàng của một người dùng (sắp xếp mới nhất lên đầu) [cite: 2025-11-17]
    List<Orders> findByUserIdOrderByCreatedAtDesc(String userId);

    // Tìm kiếm đơn hàng theo trạng thái (Ví dụ: Tìm tất cả đơn đang chờ duyệt) [cite: 2026-02-25]
    Page<Orders> findByStatus(OrdersStatus status, Pageable pageable);

    // Đếm số lượng đơn hàng của một User (để giới hạn lượt đặt cọc nếu cần) [cite: 2026-02-25]
    long countByUserIdAndStatus(String userId, OrdersStatus status);
}