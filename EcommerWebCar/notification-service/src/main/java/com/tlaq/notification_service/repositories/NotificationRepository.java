package com.tlaq.notification_service.repositories;

import com.tlaq.notification_service.entity.Notifications;
import com.tlaq.notification_service.entity.enums.NotificationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends MongoRepository<Notifications, String> {

    // Tìm thông báo theo người nhận, phân trang và sắp xếp
    Page<Notifications> findByRecipientId(String recipientId, Pageable pageable);

    // Đếm số thông báo chưa đọc (UNREAD)
    long countByRecipientIdAndStatus(String recipientId, NotificationStatus status);

    // Tìm nhanh các thông báo chưa gửi thành công để retry
    List<Notifications> findByStatus(NotificationStatus status);
}