package com.tlaq.identity_service.service;

import com.tlaq.identity_service.dto.request.*;
import com.tlaq.identity_service.dto.response.IntrospectResponse;
import com.tlaq.identity_service.dto.response.ProfileResponse;
import com.tlaq.identity_service.dto.response.TokenResponse;
import org.springframework.web.multipart.MultipartFile;

public interface AuthenticationService {
    ProfileResponse register(RegistrationRequest request, MultipartFile avatar);
    ProfileResponse createStaff(StaffRegistrationRequest request);
    TokenResponse login(LoginRequest request);
    IntrospectResponse introspect(IntrospectRequest request);
    TokenResponse refreshToken(RefreshTokenRequest request);
    void logout(LogoutRequest request);
}
