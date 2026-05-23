package com.tlaq.catalog_service.controller;

import com.tlaq.catalog_service.dto.ApiResponse;
import com.tlaq.catalog_service.dto.PageResponse;
import com.tlaq.catalog_service.dto.response.ListCarStaffResponse;
import com.tlaq.catalog_service.service.CarService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/staff/management")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class StaffCarController {
    CarService carService;

    @PreAuthorize("hasRole('STAFF')")
    @GetMapping("/cars")
    public ApiResponse<PageResponse<ListCarStaffResponse>> getManagementCars(
            @RequestParam(value = "page", required = false, defaultValue = "1") int page,
            @RequestParam(value = "size", required = false, defaultValue = "10") int size
    ) {
        return ApiResponse.<PageResponse<ListCarStaffResponse>>builder()
                .result(carService.getStaffManagementCars(page, size))
                .build();
    }
}
