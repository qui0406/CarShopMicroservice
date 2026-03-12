package com.tlaq.catalog_service.service;

import com.tlaq.catalog_service.dto.PageResponse;
import com.tlaq.catalog_service.dto.request.AppraisalRequestDto;
import com.tlaq.catalog_service.dto.response.AppraisalResponse;
import com.tlaq.catalog_service.entity.enums.AppraisalStatus;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

public interface AppraisalService {
    // Cho Khách hàng
    AppraisalResponse createAppraisal(AppraisalRequestDto dto, List<MultipartFile> images);
    List<AppraisalResponse> getMyAppraisals();

    // Cho Nhân viên Showroom (Admin)
    PageResponse<AppraisalResponse> getAllAppraisals(int page, int size, String status);
    AppraisalResponse updateOfferedPrice(String id, BigDecimal price, String note);
    AppraisalResponse updateStatus(String id, AppraisalStatus status);

    // Hàm "đinh": Chuyển đổi từ yêu cầu thu mua thành xe trong kho để bán
    void convertToInventory(String appraisalId);
}
