package com.tlaq.catalog_service.service;

import com.tlaq.catalog_service.dto.PageResponse;
import com.tlaq.catalog_service.dto.request.CarBranchRequest;
import com.tlaq.catalog_service.dto.response.CarBranchResponse;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface CarBranchService {
    PageResponse<CarBranchResponse> getAll(int page, int size);
    CarBranchResponse getById(Long id);
    CarBranchResponse create(CarBranchRequest request, MultipartFile imageBranch);
    void deleteById(Long id);
}
