package com.tlaq.catalog_service.service;

import com.tlaq.catalog_service.dto.request.ShowRoomRequest;
import com.tlaq.catalog_service.dto.response.ShowRoomResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ShowRoomService {
    ShowRoomResponse getShowRoom();
    ShowRoomResponse createShowRoom(ShowRoomRequest showRoomRequest, List<MultipartFile> images);
    ShowRoomResponse updateShowRoom(ShowRoomRequest showRoomRequest, List<MultipartFile> images, String showroomId);
    void deleteShowRoom(String showroomId);
}
