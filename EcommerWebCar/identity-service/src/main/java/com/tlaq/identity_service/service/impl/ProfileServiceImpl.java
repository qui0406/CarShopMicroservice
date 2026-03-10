package com.tlaq.identity_service.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.tlaq.identity_service.dto.request.*;
import com.tlaq.identity_service.dto.response.IntrospectResponse;
import com.tlaq.identity_service.dto.response.ProfileResponse;
import com.tlaq.identity_service.dto.response.TokenExchangeParam;
import com.tlaq.identity_service.dto.response.TokenResponse;
import com.tlaq.identity_service.entity.Profile;
import com.tlaq.identity_service.entity.Role;
import com.tlaq.identity_service.exception.AppException;
import com.tlaq.identity_service.exception.ErrorCode;
import com.tlaq.identity_service.exception.ErrorNormalizer;
import com.tlaq.identity_service.mapper.ProfileMapper;
import com.tlaq.identity_service.repo.ProfileRepository;

import com.tlaq.identity_service.repo.RoleRepository;
import com.tlaq.identity_service.repo.httpClient.KeyCloakClient;
import com.tlaq.identity_service.service.ProfileService;
import feign.FeignException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProfileServiceImpl implements ProfileService {
    ProfileRepository profileRepository;
    ProfileMapper profileMapper;
    KeyCloakClient identityClient;
    ErrorNormalizer errorNormalizer;
    Cloudinary cloudinary;
    RoleRepository roleRepository;

    @Value("${idp.client-id}")
    @NonFinal
    String clientId;

    @Value("${idp.client-secret}")
    @NonFinal
    String clientSecret;

    public ProfileResponse getMyProfile() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();

        var roles = new ArrayList<>();
        for (GrantedAuthority grantedAuthority : authentication.getAuthorities()) {
            String authority = grantedAuthority.getAuthority();
            roles.add(authority);
        }
        
        var profile = profileRepository.findByUserKeyCloakId(userId).orElseThrow(
                () -> new AppException(ErrorCode.USER_NOT_EXISTED));
        Set<Role> setRoles = roleRepository.findRolesByProfileId(profile.getId());

        ProfileResponse profileResponse = profileMapper.toProfileResponse(profile);
        profileResponse.setRoles(
                setRoles.stream().map(Role::getName).collect(Collectors.toSet())
        );
        return profileResponse;
    }


    public List<ProfileResponse> getAllProfiles() {
        var profiles = profileRepository.findAll();
        return profiles.stream().map(profileMapper::toProfileResponse).toList();
    }



    @Override
    public ProfileResponse getProfileByKeyCloakId(String userKeycloakId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = authentication.getName();

        Profile profile = profileRepository.findByUserKeyCloakId(userKeycloakId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        boolean isOwner = userKeycloakId.equals(currentUserId);
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_STAFF"));

        if (!isOwner && !isAdmin) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        return profileMapper.toProfileResponse(profile);
    }

    @Override
    public ProfileResponse getProfileById(String id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = authentication.getName();

        Profile profile = profileRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        boolean isOwner = profile.getUserKeyCloakId().equals(currentUserId);
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_STAFF"));

        if (!isOwner && !isAdmin) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        return profileMapper.toProfileResponse(profile);
    }

}
