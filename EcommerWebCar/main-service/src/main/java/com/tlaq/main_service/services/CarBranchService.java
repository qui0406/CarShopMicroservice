package com.tlaq.main_service.services;

import com.tlaq.main_service.dto.PageResponse;
import com.tlaq.main_service.dto.requests.carRequest.CarBranchRequest;
import com.tlaq.main_service.dto.responses.carResponse.CarBranchResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface CarBranchService {
    List<CarBranchResponse> getAll();
    CarBranchResponse getById(Long id);
    CarBranchResponse create(CarBranchRequest request, MultipartFile imageBranch);
    void deleteById(Long id);
}
