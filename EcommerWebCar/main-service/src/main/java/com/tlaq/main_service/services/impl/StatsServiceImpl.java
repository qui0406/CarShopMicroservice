package com.tlaq.main_service.services.impl;

import com.tlaq.main_service.dto.responses.MonthlyRevenueProjection;
import com.tlaq.main_service.repositories.httpClient.PaymentClient;
import com.tlaq.main_service.services.StatsService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class StatsServiceImpl implements StatsService {
    PaymentClient paymentClient;

    @Override
    public List<MonthlyRevenueProjection> getMonthlyRevenue() {
        return paymentClient.getMonthlyRevenue().getResult();
    }

    @Override
    public MonthlyRevenueProjection getMonthlyRevenue(int year, int month) {
        return paymentClient.getRevenueByMonth(year, month).getResult();
    }
}
