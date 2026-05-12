package com.tlaq.cms_service.service.impl;

import com.tlaq.cms_service.service.StatsService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class StatsServiceImpl implements StatsService {
    // PaymentClient paymentClient;

    // @Override
    // public List<MonthlyRevenueProjection> getMonthlyRevenue() {
    //     return paymentClient.getMonthlyRevenue().getResult();
    // }

    // @Override
    // public MonthlyRevenueProjection getMonthlyRevenue(int year, int month) {
    //     return paymentClient.getRevenueByMonth(year, month).getResult();
    // }
}
