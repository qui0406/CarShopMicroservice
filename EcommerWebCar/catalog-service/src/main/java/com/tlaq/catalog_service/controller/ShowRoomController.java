package com.tlaq.catalog_service.controller;

import com.tlaq.catalog_service.dto.ApiResponse;
import com.tlaq.catalog_service.dto.request.ShowRoomRequest;
import com.tlaq.catalog_service.dto.response.ShowRoomResponse;
import com.tlaq.catalog_service.service.ShowRoomService;
import com.tlaq.catalog_service.validators.ImageConstraint;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ShowRoomController {
    ShowRoomService showRoomService;

    @GetMapping("/showroom/get-info-showroom")
    public ApiResponse<ShowRoomResponse> getInfo(){
        return ApiResponse.<ShowRoomResponse>builder()
                .result(showRoomService.getShowRoom())
                .build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping(value = "/admin/create-showroom", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<ShowRoomResponse> createCar(@ModelAttribute ShowRoomRequest request,
                                                   @RequestParam("images") @Valid
                                                   @ImageConstraint(min = 1, max = 5, message = "Chọn từ 1 tới 5 ảnh")
                                                   List<MultipartFile> images) {
        return ApiResponse.<ShowRoomResponse>builder()
                .result(showRoomService.createShowRoom(request, images))
                .build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping(value= "/admin/update-showroom/{showroomId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<ShowRoomResponse> updateShowRoom(@ModelAttribute ShowRoomRequest showRoomRequest,
                                                        @RequestParam("images") @Valid List<MultipartFile> images,
                                                        @ImageConstraint(min = 1, max = 5, message = "Chọn từ 1 tới 5 ảnh")
                                                        @PathVariable(value="showroomId") String showroomId) {
        return ApiResponse.<ShowRoomResponse>builder()
                .result(showRoomService.updateShowRoom(showRoomRequest, images, showroomId))
                .build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/admin/delete-showroom/{showroomId}")
    public ApiResponse<Void> deleteShowRoom(@PathVariable(value="showroomId") String showroomId) {
        showRoomService.deleteShowRoom(showroomId);
        return ApiResponse.<Void>builder()
                .message("Delete show room successfully!")
                .build();
    }
}
