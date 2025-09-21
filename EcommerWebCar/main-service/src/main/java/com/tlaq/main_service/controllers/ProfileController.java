package com.tlaq.main_service.controllers;

import com.tlaq.main_service.dto.ApiResponse;
import com.tlaq.main_service.dto.keycloak.IntrospectRequest;
import com.tlaq.main_service.dto.keycloak.LoginRequest;
import com.tlaq.main_service.dto.requests.RegistrationRequest;
import com.tlaq.main_service.dto.responses.IntrospectResponse;
import com.tlaq.main_service.dto.responses.ProfileResponse;
import com.tlaq.main_service.dto.responses.TokenResponse;
import com.tlaq.main_service.services.ProfileService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
@RequestMapping("/api/profile")
public class ProfileController {
    ProfileService profileService;

    @PostMapping("/register")
    public ApiResponse<ProfileResponse> register(@ModelAttribute @Valid RegistrationRequest request,
                                                 MultipartFile avatar) {
        return ApiResponse.<ProfileResponse>builder()
                .result(profileService.register(request, avatar))
                .build();
    }

    @PostMapping("/login")
    public ApiResponse<TokenResponse> login(@RequestBody LoginRequest request) {
        return ApiResponse.<TokenResponse>builder()
                .result(profileService.login(request))
                .build();
    }

    @PostMapping("/introspect")
    public ApiResponse<IntrospectResponse> introspect(@RequestBody IntrospectRequest request) {
        return ApiResponse.<IntrospectResponse>builder()
                .result(profileService.introspect(request))
                .build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/profiles")
    public ApiResponse<List<ProfileResponse>> getAllProfiles() {
        return ApiResponse.<List<ProfileResponse>>builder()
                .result(profileService.getAllProfiles())
                .build();
    }

    @GetMapping("/my-profile")
    public ApiResponse<ProfileResponse> getMyProfiles() {
        return ApiResponse.<ProfileResponse>builder()
                .result(profileService.getMyProfile())
                .build();
    }

    @GetMapping("/get-profile/{userKeyCloakId}")
    public ApiResponse<ProfileResponse> getProfile(@PathVariable String userKeyCloakId) {
        return ApiResponse.<ProfileResponse>builder()
                .result(profileService.getProfileByKeyCloakId(userKeyCloakId))
                .build();
    }

    @GetMapping("/get-profile-by-id/{id}")
    public ApiResponse<ProfileResponse> getProfileById(@PathVariable String id) {
        return ApiResponse.<ProfileResponse>builder()
                .result(profileService.getProfileById(id))
                .build();
    }
}
