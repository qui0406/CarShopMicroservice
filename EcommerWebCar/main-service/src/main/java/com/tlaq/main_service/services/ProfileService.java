package com.tlaq.main_service.services;

import com.tlaq.main_service.dto.keycloak.IntrospectRequest;
import com.tlaq.main_service.dto.keycloak.LoginRequest;
import com.tlaq.main_service.dto.requests.RegistrationRequest;
import com.tlaq.main_service.dto.responses.IntrospectResponse;
import com.tlaq.main_service.dto.responses.ProfileResponse;
import com.tlaq.main_service.dto.responses.TokenResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ProfileService {
    ProfileResponse getMyProfile();
    List<ProfileResponse> getAllProfiles();
    ProfileResponse register(RegistrationRequest request, MultipartFile avatar);
    TokenResponse login(LoginRequest request);
    IntrospectResponse introspect(IntrospectRequest request);
    ProfileResponse getProfileByKeyCloakId(String userKeyCloakId);
}
