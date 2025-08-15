package com.tlaq.main_service.controllers;

import com.tlaq.main_service.dto.ApiResponse;
import com.tlaq.main_service.dto.requests.showroomRequest.ShowRoomRequest;
import com.tlaq.main_service.dto.requests.voucherRequest.VoucherRequest;
import com.tlaq.main_service.dto.responses.showroomResponse.ShowRoomResponse;
import com.tlaq.main_service.dto.responses.voucherResponse.VoucherResponse;
import com.tlaq.main_service.services.VoucherService;
import com.tlaq.main_service.validators.ImageConstraint;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Slf4j
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/voucher")
public class VoucherController {
    VoucherService voucherService;

    @GetMapping(value= "/get-all-voucher/{showroomId}")
    public ApiResponse<List<VoucherResponse>> getVouchers(@PathVariable String showroomId) {
        return ApiResponse.<List<VoucherResponse>> builder()
                .result(voucherService.getVouchers(showroomId))
                .build();
    }

    @GetMapping(value ="/get-voucher/{voucherId}")
    public ApiResponse<VoucherResponse> getVoucher(@PathVariable Long voucherId) {
        return ApiResponse.<VoucherResponse> builder()
                .result(voucherService.getVoucher(voucherId))
                .build();
    }

    @PostMapping(value = "/create/{showroomId}")
    public ApiResponse<VoucherResponse> createVoucher(@RequestBody VoucherRequest request,
                                                  @PathVariable(value = "showroomId") String showroomId) {
        return ApiResponse.<VoucherResponse>builder()
                .result(voucherService.createVoucher(request, showroomId))
                .build();
    }

    @PutMapping(value = "/update/{voucherId}")
    public ApiResponse<VoucherResponse> updateVoucher(@RequestBody VoucherRequest request,
                                                      @PathVariable Long voucherId) {
        return ApiResponse.<VoucherResponse>builder()
                .result(voucherService.updateVoucher(request, voucherId))
                .build();
    }

    @DeleteMapping(value = "/delete/{voucherId}")
    public ApiResponse<Void> deleteVoucher(@PathVariable Long voucherId) {
        voucherService.deleteVoucher(voucherId);
        return ApiResponse.<Void> builder()
                .message("Deleted voucher")
                .build();
    }
}
