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
    Page<Notifications> findByRecipientId(String recipientId, Pageable pageable);
}