package com.tlaq.main_service.services.impl;


import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.tlaq.main_service.dto.requests.showroomRequest.ShowRoomRequest;
import com.tlaq.main_service.dto.responses.showroomResponse.ShowRoomResponse;
import com.tlaq.main_service.entity.Profile;
import com.tlaq.main_service.entity.ShowRoom;
import com.tlaq.main_service.entity.ShowRoomImage;
import com.tlaq.main_service.exceptions.AppException;
import com.tlaq.main_service.exceptions.ErrorCode;
import com.tlaq.main_service.mapper.ShowRoomMapper;
import com.tlaq.main_service.repositories.ProfileRepository;
import com.tlaq.main_service.repositories.ShowRoomRepository;
import com.tlaq.main_service.services.ShowRoomService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ShowRoomServiceImpl implements ShowRoomService {
    ShowRoomRepository showRoomRepository;
    ProfileRepository profileRepository;
    ShowRoomMapper showRoomMapper;
    Cloudinary cloudinary;

    @Override
    public ShowRoomResponse getShowRoom() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String id =  authentication.getName();
        Profile profile = profileRepository.findByUserKeyCloakId(id)
                .orElseThrow(()->new AppException(ErrorCode.USER_NOT_EXISTED));
        return showRoomMapper.toShowRoomResponse(showRoomRepository.findByOwnerId(profile.getId())
                .orElseThrow(()-> new AppException(ErrorCode.SHOW_ROOM_NOT_FOUND)));
    }

    @Override
    public ShowRoomResponse createShowRoom(ShowRoomRequest request, List<MultipartFile> images) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String id = authentication.getName();
        Profile profile = profileRepository.findByUserKeyCloakId(id)
                .orElseThrow(()-> new AppException(ErrorCode.USER_NOT_EXISTED));

        if(showRoomRepository.existsShowRoomByOwnerId(profile.getId())) {
            throw new AppException(ErrorCode.USER_HAS_SHOW_ROOM);
        }

        request.setProfileId(profile.getId());

        ShowRoom showRoom = showRoomMapper.toShowRoom(request);
        List<ShowRoomImage> showRoomImages = new ArrayList<>();

        if (images != null && !images.isEmpty()) {
            for (MultipartFile img : images) {
                try {
                    Map res = cloudinary.uploader().upload(img.getBytes(),
                            ObjectUtils.asMap("resource_type", "auto"));
                    String imageUrl = res.get("secure_url").toString();
                    ShowRoomImage showImg = ShowRoomImage.builder()
                            .image(imageUrl)
                            .build();
                    showRoomImages.add(showImg);
                } catch (IOException ex) {
                    throw new AppException(ErrorCode.UPLOAD_IMAGE_ERROR);
                }
            }
        }else{
            throw new AppException(ErrorCode.IMAGE_IS_EMPTY);
        }

        showRoom.setShowRoomImages(showRoomImages);
        showRoom.setOwner(profile);
        showRoomRepository.save(showRoom);
        return showRoomMapper.toShowRoomResponse(showRoom);
    }

    @Override
    public ShowRoomResponse updateShowRoom(ShowRoomRequest request, List<MultipartFile> images, String showroomId) {
        ShowRoom showRoom = showRoomRepository.findById(showroomId).orElseThrow(()-> new AppException(ErrorCode.SHOW_ROOM_NOT_FOUND));

        if(request.getAddress()!= null) showRoom.setAddress(request.getAddress());
        if(request.getFacebook() != null) showRoom.setFacebook(request.getFacebook());
        if(request.getEmail() != null) showRoom.setEmail(request.getEmail());
        if(request.getZalo() != null) showRoom.setZalo(request.getZalo());
        if(request.getPhone()!= null) showRoom.setPhone(request.getPhone());
        if(request.getName() != null) showRoom.setName(request.getName());
        if(request.getLatitude()!= null) showRoom.setLatitude(request.getLatitude());
        if(request.getLongitude()!= null) showRoom.setLongitude(request.getLongitude());

        List<ShowRoomImage> showRoomImages = new ArrayList<>();

        if (images != null && !images.isEmpty()) {
            for (MultipartFile img : images) {
                try {
                    Map res = cloudinary.uploader().upload(img.getBytes(),
                            ObjectUtils.asMap("resource_type", "auto"));
                    String imageUrl = res.get("secure_url").toString();
                    ShowRoomImage showImg = ShowRoomImage.builder()
                            .image(imageUrl)
                            .build();
                    showRoomImages.add(showImg);
                } catch (IOException ex) {
                    throw new AppException(ErrorCode.UPLOAD_IMAGE_ERROR);
                }
            }
        }else{
            throw new AppException(ErrorCode.IMAGE_IS_EMPTY);
        }

        showRoom.setShowRoomImages(showRoomImages);
        showRoomRepository.save(showRoom);
        return showRoomMapper.toShowRoomResponse(showRoom);
    }

    @Override
    public void deleteShowRoom(String showroomId) {
        showRoomRepository.deleteById(showroomId);
    }
}
