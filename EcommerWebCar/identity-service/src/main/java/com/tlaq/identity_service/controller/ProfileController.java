package com.tlaq.identity_service.controller;

import com.tlaq.identity_service.dto.ApiResponse;
import com.tlaq.identity_service.dto.request.*;
import com.tlaq.identity_service.dto.response.ProfileResponse;
import com.tlaq.identity_service.service.ProfileService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
@RequestMapping("/api/profile")
public class ProfileController {
    ProfileService profileService;

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

    @GetMapping("/get-profile-by-keycloak-id/{userKeyCloakId}")
    public ApiResponse<ProfileResponse> getProfileByUserKeyCloakId(@PathVariable String userKeyCloakId) {
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
