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
public class ProfileServiceImpl implements ProfileService {

    private final ProfileRepository profileRepository;
    private final ProfileMapper profileMapper;

    public ProfileServiceImpl(ProfileRepository profileRepository, ProfileMapper profileMapper) {
        this.profileRepository = profileRepository;
        this.profileMapper = profileMapper;
    }

    // Đã xóa clientId, clientSecret và RoleRepository vì không thực sự cần thiết nếu thiết kế DB chuẩn

    @Override
    public ProfileResponse getMyProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();

        Profile profile = profileRepository.findByUserKeyCloakId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        ProfileResponse profileResponse = profileMapper.toProfileResponse(profile);

        // Nếu Entity Profile của bạn đã định nghĩa Set<Role> roles, hãy lấy trực tiếp:
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

    /**
     * Hàm dùng chung để kiểm tra quyền truy cập (DRY principle).
     * Tuy nhiên, Khuyến khích dùng @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF') or #userId == authentication.name")
     * trên tầng Controller thay vì viết hàm này.
     */
    private void verifyAccessPermission(String targetUserId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = authentication.getName();

        boolean isOwner = targetUserId.equals(currentUserId);
        boolean isAdminOrStaff = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_STAFF"));

        if (!isOwner && !isAdminOrStaff) {
            // Ném lỗi ACCESS_DENIED (403) thay vì UNAUTHORIZED (401)
            throw new AppException(ErrorCode.UNAUTHORIZED); // Chỗ này bạn tự định nghĩa thêm ErrorCode.ACCESS_DENIED nhé
        }
    }
}