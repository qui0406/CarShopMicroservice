package com.tlaq.catalog_service.controller;

import com.tlaq.catalog_service.dto.ApiResponse;
import com.tlaq.catalog_service.dto.request.EquipmentRequest;
import com.tlaq.catalog_service.dto.response.EquipmentResponse;
import com.tlaq.catalog_service.service.CarSpecificationService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/specifications")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class CarSpecificationController {
    CarSpecificationService carSpecificationService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<EquipmentResponse> create(@RequestBody @Valid EquipmentRequest request) {
        log.info("Đang tạo bộ thông số kỹ thuật mới");
        return ApiResponse.<EquipmentResponse>builder()
                .result(carSpecificationService.create(request))
                .build();
    }

    @GetMapping
    public ApiResponse<List<EquipmentResponse>> getAll() {
        return ApiResponse.<List<EquipmentResponse>>builder()
                .result(carSpecificationService.findAll())
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<EquipmentResponse> getById(@PathVariable Long id) {
        return ApiResponse.<EquipmentResponse>builder()
                .result(carSpecificationService.getByCarId(id))
                .build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<EquipmentResponse> update(
            @PathVariable Long id,
            @RequestBody @Valid EquipmentRequest request) {
        return ApiResponse.<EquipmentResponse>builder()
                .result(carSpecificationService.update(id, request))
                .build();
    }

    // 5. Xóa bộ thông số (Lưu ý: Chỉ xóa được khi chưa có xe nào sử dụng spec này)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<String> delete(@PathVariable Long id) {
        carSpecificationService.delete(id);
        return ApiResponse.<String>builder()
                .result("Xóa bộ thông số thành công!")
                .build();
    }
}