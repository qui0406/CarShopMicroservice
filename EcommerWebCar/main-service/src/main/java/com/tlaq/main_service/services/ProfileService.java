package com.tlaq.main_service.services;

import com.tlaq.main_service.dto.requests.RegistrationRequest;
import com.tlaq.main_service.dto.responses.ProfileResponse;

import java.util.List;

public interface ProfileService {
    ProfileResponse getMyProfile();
    List<ProfileResponse> getAllProfiles();
    ProfileResponse register(RegistrationRequest request);

}
