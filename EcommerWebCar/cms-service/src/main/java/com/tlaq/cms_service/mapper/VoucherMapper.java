package com.tlaq.cms_service.mapper;

import com.tlaq.cms_service.dto.request.VoucherRequest;
import com.tlaq.cms_service.dto.response.VoucherResponse;
import com.tlaq.cms_service.entity.Voucher;
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
