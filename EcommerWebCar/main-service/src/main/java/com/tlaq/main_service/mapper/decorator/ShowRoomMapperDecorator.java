package com.tlaq.main_service.mapper.decorator;

import com.tlaq.main_service.dto.requests.showroomRequest.ShowRoomRequest;
import com.tlaq.main_service.dto.responses.showroomResponse.ShowRoomResponse;
import com.tlaq.main_service.entity.ShowRoom;
import com.tlaq.main_service.entity.ShowRoomImage;
import com.tlaq.main_service.exceptions.AppException;
import com.tlaq.main_service.exceptions.ErrorCode;
import com.tlaq.main_service.mapper.CarMapper;
import com.tlaq.main_service.mapper.ShowRoomMapper;
import com.tlaq.main_service.repositories.ProfileRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Component
public class ShowRoomMapperDecorator implements ShowRoomMapper {
    @Autowired
    @Qualifier("delegate")
    private ShowRoomMapper delegate;

    @Autowired
    private ProfileRepository profileRepository;

    @Override
    public ShowRoom toShowRoom(ShowRoomRequest request) {
        ShowRoom showRoom = ShowRoom.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .address(request.getAddress())
                .facebook(request.getFacebook())
                .zalo(request.getZalo())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .build();


        showRoom.setOwner(profileRepository.findById(request.getProfileId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED)));
        return showRoom;
    }

    @Override
    public ShowRoomResponse toShowRoomResponse(ShowRoom showRoom) {
        ShowRoomResponse showRoomResponse = delegate.toShowRoomResponse(showRoom);

        if (showRoom.getShowRoomImages() != null) {
            List<String> images = showRoom.getShowRoomImages().stream()
                    .map(ShowRoomImage::getImage)
                    .collect(Collectors.toList());
            showRoomResponse.setImages(images);
        } else {
            showRoomResponse.setImages(new ArrayList<>());
        }

        if (showRoom.getOwner() != null) {
            ShowRoomResponse.Profile profile = new ShowRoomResponse.Profile();
            profile.setId(showRoom.getOwner().getId());
            profile.setUsername(showRoom.getOwner().getUsername());
            profile.setFirstname(showRoom.getOwner().getFirstName());
            profile.setLastname(showRoom.getOwner().getLastName());
            profile.setEmail(showRoom.getOwner().getEmail());

            showRoomResponse.setOwner(profile);
        }else{
            throw new AppException(ErrorCode.SHOW_ROOM_IS_EMPTY);
        }
        return showRoomResponse;
    }
}
