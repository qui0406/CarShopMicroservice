package com.tlaq.identity_service.service;


import com.tlaq.identity_service.dto.request.IntrospectRequest;
import com.tlaq.identity_service.dto.request.LoginRequest;
import com.tlaq.identity_service.dto.request.RegistrationRequest;
import com.tlaq.identity_service.dto.response.IntrospectResponse;
import com.tlaq.identity_service.dto.response.ProfileResponse;
import com.tlaq.identity_service.dto.response.TokenResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ProfileService {
    ProfileResponse getMyProfile();
    List<ProfileResponse> getAllProfiles();
    ProfileResponse register(RegistrationRequest request, MultipartFile avatar);
    TokenResponse login(LoginRequest request);
    IntrospectResponse introspect(IntrospectRequest request);
    ProfileResponse getProfileByKeyCloakId(String userKeyCloakId);
    ProfileResponse getProfileById(String id);
}
