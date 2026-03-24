package com.tlaq.notification_service.controllers;

import com.tlaq.event.dto.NotificationEvent;
import com.tlaq.notification_service.configs.RabbitMQConfig;
import com.tlaq.notification_service.dto.ApiResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/api/email")
public class EmailController {

    RabbitTemplate rabbitTemplate;

    @PostMapping("/send")
    public ApiResponse<String> sendEmailRequest(@RequestBody @Validated NotificationEvent event) {
        log.info("📨 Pushing notification event to queue for recipient: {}", event.getRecipientId());

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.NOTIFICATION_EXCHANGE,
                RabbitMQConfig.NOTIFICATION_ROUTING_KEY,
                event
        );

        return ApiResponse.<String>builder()
                .result("Yêu cầu gửi mail đã được tiếp nhận và đang xử lý.")
                .build();
    }
}