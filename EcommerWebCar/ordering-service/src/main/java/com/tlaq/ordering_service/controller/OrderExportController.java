package com.tlaq.ordering_service.controller;

import com.tlaq.ordering_service.dto.ApiResponse;
import com.tlaq.ordering_service.service.OrderExportService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/orders/export")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderExportController {
    OrderExportService orderExportService;

    @GetMapping(value = "/{orderId}/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> downloadOrderPdf(@PathVariable String orderId) {
        byte[] pdfContent = orderExportService.exportOrderPdf(orderId);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=Invoice_" + orderId + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfContent);
    }

    @PostMapping("/{orderId}/send-email")
    public ApiResponse<String> sendEmail(@PathVariable String orderId, @RequestParam String email) {
        orderExportService.sendOrderEmail(orderId, email);
        return ApiResponse.<String>builder()
                .result("Hóa đơn đã được gửi đến email: " + email)
                .build();
    }
}