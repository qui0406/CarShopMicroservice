package com.tlaq.identity_service.service.impl;

import com.tlaq.identity_service.dto.response.ProfileResponse;
import com.tlaq.identity_service.entity.Profile;
import com.tlaq.identity_service.entity.Role;
import com.tlaq.identity_service.exception.AppException;
import com.tlaq.identity_service.exception.ErrorCode;
import com.tlaq.identity_service.mapper.ProfileMapper;
import com.tlaq.identity_service.repo.ProfileRepository;
import com.tlaq.identity_service.service.ProfileService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProfileServiceImpl implements ProfileService {
    ProfileRepository profileRepository;
    ProfileMapper profileMapper;

    @Override
    public ProfileResponse getMyProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();

        Profile profile = profileRepository.findByUserKeyCloakId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        ProfileResponse profileResponse = profileMapper.toProfileResponse(profile);

        if (profile.getRoles() != null) {
            profileResponse.setRoles(
                    profile.getRoles().stream()
                            .map(Role::getName)
                            .collect(Collectors.toSet())
            );
        }

        return profileResponse;
    }

    @Override
    public Page<ProfileResponse> getAllProfiles(Pageable pageable) {
        return profileRepository.findAll(pageable)
                .map(profileMapper::toProfileResponse);
    }

    @Override
    public ProfileResponse getProfileByKeyCloakId(String userKeycloakId) {
        Profile profile = profileRepository.findByUserKeyCloakId(userKeycloakId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        verifyAccessPermission(profile.getUserKeyCloakId());

        return profileMapper.toProfileResponse(profile);
    }

    @Override
    public ProfileResponse getProfileById(String id) {
        Profile profile = profileRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        verifyAccessPermission(profile.getUserKeyCloakId());

        return profileMapper.toProfileResponse(profile);
    }

    private void verifyAccessPermission(String targetUserId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = authentication.getName();

        boolean isOwner = targetUserId.equals(currentUserId);
        boolean isAdminOrStaff = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_STAFF"));

        if (!isOwner && !isAdminOrStaff) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }
}