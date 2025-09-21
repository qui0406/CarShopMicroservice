package com.tlaq.payment_service.services;

import com.tlaq.payment_service.dto.response.MonthlyRevenueProjection;
import com.tlaq.payment_service.dto.response.MonthlyRevenueResponse;
import com.tlaq.payment_service.repository.CashierNotDepositRepository;
import com.tlaq.payment_service.repository.CashierRepository;
import com.tlaq.payment_service.repository.DepositRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@Slf4j
public class StatsService {
    @Autowired
    CashierRepository cashierRepository;

    @Autowired
    CashierNotDepositRepository cashierNotDepositRepository;

    @Autowired
    DepositRepository depositRepository;

    public List<MonthlyRevenueProjection> getAllMonthlyRevenue() {
        return cashierNotDepositRepository.getMonthlyRevenue();
    }

    public MonthlyRevenueProjection getRevenueByMonth(int year, int month) {
        return cashierNotDepositRepository.getMonthlyRevenueByMonth(year, month);
    }
}
