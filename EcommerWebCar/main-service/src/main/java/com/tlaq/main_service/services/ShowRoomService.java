package com.tlaq.main_service.services;

import com.tlaq.main_service.dto.requests.showroomRequest.ShowRoomRequest;
import com.tlaq.main_service.dto.responses.showroomResponse.ShowRoomResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ShowRoomService {
    ShowRoomResponse getShowRoom();
    ShowRoomResponse createShowRoom(ShowRoomRequest showRoomRequest, List<MultipartFile> images);
    ShowRoomResponse updateShowRoom(ShowRoomRequest showRoomRequest, List<MultipartFile> images, String showroomId);
    void deleteShowRoom(String showroomId);
}
