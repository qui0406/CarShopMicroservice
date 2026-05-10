package com.tlaq.identity_service.service;

import com.tlaq.identity_service.dto.response.ProfileResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProfileService {
    ProfileResponse getMyProfile();
    Page<ProfileResponse> getAllProfiles(Pageable pageable);
    ProfileResponse getProfileByKeyCloakId(String userKeyCloakId);
    ProfileResponse getProfileById(String id);
}
