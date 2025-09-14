package com.tlaq.payment_service.mapper;

import com.tlaq.payment_service.dto.response.CashierNotDepositResponse;
import com.tlaq.payment_service.entity.CashierNotDeposit;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CashierNotDepositMapper {
    CashierNotDepositResponse toCashierNotDepositResponse(CashierNotDeposit cashierNotDeposit);
}
