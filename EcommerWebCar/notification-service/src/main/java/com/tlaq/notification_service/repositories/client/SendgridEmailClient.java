//package com.tlaq.notification_service.repositories.client;
//
//import com.tlaq.notification_service.configs.SendGridConfig;
//import com.tlaq.notification_service.dto.requests.EmailRequest;
//import com.tlaq.notification_service.dto.responses.EmailResponse;
//import org.springframework.cloud.openfeign.FeignClient;
//import org.springframework.http.MediaType;
//import org.springframework.web.bind.annotation.PostMapping;
//import org.springframework.web.bind.annotation.RequestBody;
//import org.springframework.web.bind.annotation.RequestHeader;
//
//@FeignClient(
//        name = "sendgrid-email-client",
//        url = "${spring.send-grid.sendgrid-url}",
//        configuration = SendGridConfig.class
//)
//public interface SendgridEmailClient {
//    @PostMapping(
//            value = "/v3/mail/send",
//            consumes = MediaType.APPLICATION_JSON_VALUE
//    )
//    void sendEmail(
//            @RequestHeader("Authorization") String apiKey,
//            @RequestBody EmailRequest emailRequest
//    );
//}
//
