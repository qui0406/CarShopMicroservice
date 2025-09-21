package com.tlaq.main_service.services;

import com.tlaq.main_service.dto.responses.MonthlyRevenueProjection;

import java.util.List;

public interface StatsService {
    List<MonthlyRevenueProjection> getMonthlyRevenue();
    MonthlyRevenueProjection getMonthlyRevenue(int year, int month);
}
