package com.tlaq.catalog_service.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.tlaq.catalog_service.dto.request.ShowRoomRequest;
import com.tlaq.catalog_service.dto.response.ShowRoomResponse;
import com.tlaq.catalog_service.entity.ShowRoom;
import com.tlaq.catalog_service.entity.ShowRoomImage;
import com.tlaq.catalog_service.exceptions.AppException;
import com.tlaq.catalog_service.exceptions.ErrorCode;
import com.tlaq.catalog_service.mapper.ShowRoomMapper;
import com.tlaq.catalog_service.repo.ShowRoomRepository;
import com.tlaq.catalog_service.repo.httpClient.IdentityClient;
import com.tlaq.catalog_service.service.ShowRoomService;
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
    ShowRoomMapper showRoomMapper;
    Cloudinary cloudinary;
    IdentityClient identityClient;

    @Override
    public ShowRoomResponse getShowRoom() {
        ShowRoom showRoom = showRoomRepository.findMainShowRoom()
                .orElseThrow(() -> new AppException(ErrorCode.SHOWROOM_NOT_FOUND));
        return showRoomMapper.toShowRoomResponse(showRoom);
    }

    @Override
    public ShowRoomResponse createShowRoom(ShowRoomRequest request, List<MultipartFile> images) {
        if (showRoomRepository.count() > 0) {
            throw new AppException(ErrorCode.SHOWROOM_ALREADY_EXISTS);
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userKeyCloakId = authentication.getName();

        var profileResponse = identityClient.getProfileByUserKeycloakId(userKeyCloakId);
        String profileId = profileResponse.getResult().getId();

        ShowRoom showRoom = showRoomMapper.toShowRoom(request);
        showRoom.setOwnerId(profileId);

        uploadImages(images, showRoom);
        return showRoomMapper.toShowRoomResponse(showRoomRepository.save(showRoom));
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

        if (images != null && !images.isEmpty()) {
            uploadImages(images, showRoom);
        }

        return showRoomMapper.toShowRoomResponse(showRoomRepository.save(showRoom));
    }

    @Override
    public void deleteShowRoom(String showroomId) {
        showRoomRepository.deleteById(showroomId);
    }

    private void uploadImages(List<MultipartFile> images, ShowRoom showRoom) {
        if (images == null || images.isEmpty()) return;

        List<ShowRoomImage> showRoomImages = new ArrayList<>();
        for (MultipartFile img : images) {
            try {
                Map res = cloudinary.uploader().upload(img.getBytes(),
                        ObjectUtils.asMap("resource_type", "auto"));
                String imageUrl = res.get("secure_url").toString();
                showRoomImages.add(ShowRoomImage.builder()
                        .image(imageUrl)
                        .showRoom(showRoom) // Quan hệ 2 chiều [cite: 2026-02-25]
                        .build());
            } catch (IOException ex) {
                throw new AppException(ErrorCode.UPLOAD_IMAGE_ERROR);
            }
        }
        showRoom.setShowRoomImages(showRoomImages);
    }
}
