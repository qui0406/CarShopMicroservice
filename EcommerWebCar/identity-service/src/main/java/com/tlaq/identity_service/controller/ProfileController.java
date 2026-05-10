package com.tlaq.identity_service.controller;

import com.tlaq.identity_service.dto.ApiResponse;
import com.tlaq.identity_service.dto.request.*;
import com.tlaq.identity_service.dto.response.ProfileResponse;
import com.tlaq.identity_service.service.ProfileService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;


@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
@RequestMapping("/api/profile")
public class ProfileController {
    ProfileService profileService;

    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @GetMapping("/all-profiles")
    public ApiResponse<Page<ProfileResponse>> getAllProfiles(
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "size", defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by("id").descending()); // Sắp xếp mới nhất lên đầu

        return ApiResponse.<Page<ProfileResponse>>builder()
                .result(profileService.getAllProfiles(pageable))
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
