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
import org.springframework.security.core.context.SecurityContextHolder;
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

    // 1. Khách hàng gửi yêu cầu định giá xe cũ (Kèm nhiều ảnh thực tế)
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<AppraisalResponse> createAppraisal(
            @RequestPart("dto") @Valid AppraisalRequestDto dto,
            @RequestPart("images") List<MultipartFile> images) {

        // Trích xuất ID từ Token để xác định chủ nhân xe
        String userKeyCloakId = SecurityContextHolder.getContext().getAuthentication().getName();

        return ApiResponse.<AppraisalResponse>builder()
                .result(appraisalService.createAppraisal(dto, images, userKeyCloakId))
                .build();
    }

    // 2. Khách hàng xem danh sách xe mình đã gửi định giá
    @GetMapping("/my-requests")
    public ApiResponse<List<AppraisalResponse>> getMyAppraisals() {
        String userKeyCloakId = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiResponse.<List<AppraisalResponse>>builder()
                .result(appraisalService.getMyAppraisals(userKeyCloakId))
                .build();
    }

    // 3. STAFF/ADMIN xem toàn bộ yêu cầu định giá (Có phân trang và lọc theo trạng thái)
    @GetMapping
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ApiResponse<PageResponse<AppraisalResponse>> getAllAppraisals(
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "status", required = false) String status) {

        return ApiResponse.<PageResponse<AppraisalResponse>>builder()
                .result(appraisalService.getAllAppraisals(page, size, status))
                .build();
    }

    // 4. STAFF đưa ra mức giá đề nghị mua lại chiếc xe
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

    // 5. Cập nhật trạng thái (Duyệt, Từ chối, Đã mua...)
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