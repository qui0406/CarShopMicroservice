package com.tlaq.main_service.controllers;

import com.tlaq.main_service.dto.ApiResponse;
import com.tlaq.main_service.dto.requests.showroomRequest.ShowRoomRequest;
import com.tlaq.main_service.dto.responses.showroomResponse.ShowRoomResponse;
import com.tlaq.main_service.services.ShowRoomService;
import com.tlaq.main_service.validators.ImageConstraint;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/showroom")
public class ShowRoomController {
    ShowRoomService showRoomService;

    @GetMapping("/get-info-showroom")
    public ApiResponse<ShowRoomResponse> getInfo(){
        return ApiResponse.<ShowRoomResponse>builder()
                .result(showRoomService.getShowRoom())
                .build();
    }

    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<ShowRoomResponse> createCar(@ModelAttribute ShowRoomRequest request,
                                                   @RequestParam("images") @Valid
                                                   @ImageConstraint(min = 1, max = 5, message = "Chọn từ 1 tới 5 ảnh")
                                                   List<MultipartFile> images) {
        return ApiResponse.<ShowRoomResponse>builder()
                .result(showRoomService.createShowRoom(request, images))
                .build();
    }

    @PutMapping(value= "/update-showroom/{showroomId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<ShowRoomResponse> updateShowRoom(@ModelAttribute ShowRoomRequest showRoomRequest,
                                                        @RequestParam("images") @Valid List<MultipartFile> images,
                                                        @ImageConstraint(min = 1, max = 5, message = "Chọn từ 1 tới 5 ảnh")
                                                        @PathVariable(value="showroomId") String showroomId) {
        return ApiResponse.<ShowRoomResponse>builder()
                .result(showRoomService.updateShowRoom(showRoomRequest, images, showroomId))
                .build();
    }

    @DeleteMapping("/delete-showroom/{showroomId}")
    public ApiResponse<Void> deleteShowRoom(@PathVariable(value="showroomId") String showroomId) {
        showRoomService.deleteShowRoom(showroomId);
        return ApiResponse.<Void>builder()
                .message("Delete show room successfully!")
                .build();
    }
}
