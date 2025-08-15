package com.tlaq.main_service.mapper;

import com.tlaq.main_service.dto.requests.voucherRequest.VoucherRequest;
import com.tlaq.main_service.dto.responses.voucherResponse.VoucherResponse;
import com.tlaq.main_service.entity.Voucher;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

@Mapper(componentModel = "spring")
public interface VoucherMapper {
    VoucherResponse toVoucherResponse(Voucher voucher);

    Voucher toVoucher(VoucherRequest voucherRequest);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateVoucherFromRequest(VoucherRequest request, @MappingTarget Voucher voucher);

    List<VoucherResponse> toListVoucherResponse(List<Voucher> voucher);
}
