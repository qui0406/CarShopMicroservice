package com.tlaq.catalog_service.controller;

import com.tlaq.catalog_service.dto.ApiResponse;
import com.tlaq.catalog_service.dto.PageResponse;
import com.tlaq.catalog_service.dto.request.AppraisalRequestDto;
import com.tlaq.catalog_service.dto.response.AppraisalResponse;
import com.tlaq.catalog_service.entity.enums.AppraisalStatus;
import com.tlaq.catalog_service.service.AppraisalService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/appraisals")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AppraisalController {
    AppraisalService appraisalService;

    @PostMapping(value = "create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<AppraisalResponse> createAppraisal(
            @RequestPart("dto") @Valid AppraisalRequestDto dto,
            @RequestPart("images") List<MultipartFile> images) {
        return ApiResponse.<AppraisalResponse>builder()
                .result(appraisalService.createAppraisal(dto, images))
                .build();
    }

    @GetMapping("/my-requests")
    public ApiResponse<List<AppraisalResponse>> getMyAppraisals() {
        return ApiResponse.<List<AppraisalResponse>>builder()
                .result(appraisalService.getMyAppraisals())
                .build();
    }

    @GetMapping("/get-all-appraisals")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ApiResponse<PageResponse<AppraisalResponse>> getAllAppraisals(
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "status", required = false) String status) {

        return ApiResponse.<PageResponse<AppraisalResponse>>builder()
                .result(appraisalService.getAllAppraisals(page, size, status))
                .build();
    }

    @PatchMapping("/{id}/offer-price")
    @PreAuthorize("hasRole('STAFF')")
    public ApiResponse<AppraisalResponse> updateOfferedPrice(
            @PathVariable String id,
            @RequestParam BigDecimal price,
            @RequestParam String note) {

        return ApiResponse.<AppraisalResponse>builder()
                .result(appraisalService.updateOfferedPrice(id, price, note))
                .build();
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ApiResponse<AppraisalResponse> updateStatus(
            @PathVariable String id,
            @RequestParam AppraisalStatus status) {

        return ApiResponse.<AppraisalResponse>builder()
                .result(appraisalService.updateStatus(id, status))
                .build();
    }
}