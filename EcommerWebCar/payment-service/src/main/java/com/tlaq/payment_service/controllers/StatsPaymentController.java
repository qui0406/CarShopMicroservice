package com.tlaq.payment_service.controllers;

import com.tlaq.payment_service.dto.ApiResponse;
import com.tlaq.payment_service.dto.response.MonthlyRevenueProjection;
import com.tlaq.payment_service.dto.response.MonthlyRevenueResponse;
import com.tlaq.payment_service.services.StatsService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class StatsPaymentController {
    StatsService statsService;

    @GetMapping("/monthly")
    public ApiResponse<List<MonthlyRevenueProjection>> getMonthlyRevenue() {
        return ApiResponse.<List<MonthlyRevenueProjection>>builder()
                .result(statsService.getAllMonthlyRevenue())
                .build();
    }

    @GetMapping("/monthly/{year}/{month}")
    public ApiResponse<MonthlyRevenueProjection> getRevenueByMonth(
            @PathVariable int year,
            @PathVariable int month) {
        return ApiResponse.<MonthlyRevenueProjection>builder()
                .result(statsService.getRevenueByMonth(year, month))
                .build();
    }
}
