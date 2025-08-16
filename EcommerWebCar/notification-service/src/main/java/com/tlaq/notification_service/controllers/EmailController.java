package com.tlaq.notification_service.controllers;

import com.tlaq.notification_service.dto.requests.EmailRequest;
import com.tlaq.notification_service.dto.responses.EmailResponse;
import com.tlaq.notification_service.response.ApiResponse;
import com.tlaq.notification_service.services.SendGridMailService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;

@RestController
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/email")
public class EmailController {
    SendGridMailService sendGridMailService;

    @PostMapping("/send-email")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ApiResponse<EmailResponse> testSendEmail(@RequestBody EmailRequest emailRequest) {
        return ApiResponse.<EmailResponse>builder()
                .result(sendGridMailService.sendMail(emailRequest))
                .build();
    }
}
