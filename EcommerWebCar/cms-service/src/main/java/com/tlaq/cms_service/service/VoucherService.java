package com.tlaq.cms_service.service;

import com.tlaq.cms_service.dto.request.VoucherRequest;
import com.tlaq.cms_service.dto.response.VoucherResponse;

import java.util.List;

public interface VoucherService {
    VoucherResponse getVoucher(Long voucherId);
    List<VoucherResponse> getVouchers(String showroomId);
    VoucherResponse createVoucher(VoucherRequest voucherRequest, String showroomId);
    VoucherResponse updateVoucher(VoucherRequest voucherRequest, Long voucherId);
    void deleteVoucher(Long voucherId);
}
