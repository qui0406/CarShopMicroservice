package com.tlaq.notification_service.repositories;

import com.tlaq.notification_service.entity.NotificationSetting;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NotificationSettingRepository extends MongoRepository<NotificationSetting, String> {

    // Lấy cài đặt theo userId
    Optional<NotificationSetting> findByUserId(String userId);
}