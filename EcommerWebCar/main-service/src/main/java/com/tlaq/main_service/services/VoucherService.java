package com.tlaq.main_service.services;

import com.tlaq.main_service.dto.requests.voucherRequest.VoucherRequest;
import com.tlaq.main_service.dto.responses.voucherResponse.VoucherResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface VoucherService {
    VoucherResponse getVoucher(Long voucherId);
    List<VoucherResponse> getVouchers(String showroomId);
    VoucherResponse createVoucher(VoucherRequest voucherRequest, String showroomId);
    VoucherResponse updateVoucher(VoucherRequest voucherRequest, Long voucherId);
    void deleteVoucher(Long voucherId);
}
