package com.tlaq.main_service.controllers;

import com.cloudinary.Api;
import com.tlaq.main_service.dto.ApiResponse;
import com.tlaq.main_service.dto.PageResponse;
import com.tlaq.main_service.dto.requests.carRequest.CarBranchRequest;
import com.tlaq.main_service.dto.responses.carResponse.CarBranchResponse;
import com.tlaq.main_service.services.CarBranchService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.awt.*;
import java.util.List;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CarBranchController {
    CarBranchService carBranchService;

    @GetMapping("/car-branch/get-all-car-branch")
    public ApiResponse<List<CarBranchResponse>> getAll() {
        return ApiResponse.<List<CarBranchResponse>>builder()
                .result(carBranchService.getAll())
                .build();
    }

    @GetMapping("/car-branch/get-branch-by-id/{branchId}")
    public ApiResponse<CarBranchResponse> getById(@PathVariable Long branchId) {
        return ApiResponse.<CarBranchResponse>builder()
                .result(carBranchService.getById(branchId))
                .build();
    }

    @PostMapping(value = "/staff/car-branch/create-branch", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<CarBranchResponse> create(@ModelAttribute CarBranchRequest request,
                                                 MultipartFile imageBranch) {
        return ApiResponse.<CarBranchResponse>builder()
                .result(carBranchService.create(request, imageBranch))
                .build();
    }

    @DeleteMapping("/staff/delete-branch/{branchId}")
    public ApiResponse<CarBranchResponse> delete(@PathVariable Long branchId){
        carBranchService.deleteById(branchId);
        return ApiResponse.<CarBranchResponse>builder()
                .message("Car Branch has been deleted")
                .build();
    }
}
