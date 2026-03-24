package com.tlaq.notification_service.controllers;

import com.tlaq.notification_service.dto.PageResponse;
import com.tlaq.notification_service.dto.responses.NotificationResponse;
import com.tlaq.notification_service.services.NotificationService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/api/notifications")
public class NotificationController {

    NotificationService notificationService;

    @GetMapping("/my")
    public PageResponse<NotificationResponse> getMyNotifications(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return notificationService.getMyNotifications(page, size);
    }

    @PatchMapping("/{id}/read")
    public void markAsRead(@PathVariable String id) {
        notificationService.markAsRead(id);
    }
}