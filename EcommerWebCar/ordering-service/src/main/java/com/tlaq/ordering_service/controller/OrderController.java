package com.tlaq.ordering_service.controller;

import com.tlaq.ordering_service.dto.ApiResponse;
import com.tlaq.ordering_service.dto.request.OrdersRequest;
import com.tlaq.ordering_service.dto.response.OrdersResponse;
import com.tlaq.ordering_service.service.OrderExportService;
import com.tlaq.ordering_service.service.OrdersService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderController {
    OrdersService orderService;
    OrderExportService orderExportService;

    @PostMapping("/create")
    public ApiResponse<OrdersResponse> createOrder(@RequestBody OrdersRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userKeyCloak= authentication.getName();
        var result = orderService.createOrder(request, userKeyCloak);
        return ApiResponse.<OrdersResponse>builder().result(result).build();
    }

    @GetMapping("/{id}")
    public ApiResponse<OrdersResponse> getOrder(@PathVariable String id) {
        var result = orderService.getOrderById(id);
        return ApiResponse.<OrdersResponse>builder().result(result).build();
    }

    // 3. Xuất hóa đơn/Hợp đồng PDF (Điểm cộng khóa luận) [cite: 2026-03-03]
    @GetMapping("/{id}/export")
    public ResponseEntity<byte[]> exportInvoice(@PathVariable String id) {
        byte[] pdfContent = orderExportService.exportOrderPdf(id);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=invoice_" + id + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfContent);
    }
}
