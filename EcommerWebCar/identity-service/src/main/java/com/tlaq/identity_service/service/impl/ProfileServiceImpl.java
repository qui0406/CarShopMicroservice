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
//    KafkaTemplate<String, Object> kafkaTemplate;
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

        log.info(roles.toString());

        var profile = profileRepository.findByUserKeyCloakId(userId).orElseThrow(
                () -> new AppException(ErrorCode.USER_NOT_EXISTED));


        Set<Role> setRoles = roleRepository.findRolesByProfileId(profile.getId());

        ProfileResponse profileResponse = profileMapper.toProfileResponse(profile);
        profileResponse.setRoles(
                setRoles.stream().map(Role::getName).collect(Collectors.toSet())
        );

        return profileResponse;
    }

    @Override
    public TokenResponse login(LoginRequest request) {
        Authenticated auth = Authenticated.builder()
                .client_id(clientId)
                .client_secret(clientSecret)
                .grant_type("password")
                .username(request.getUsername())
                .password(request.getPassword())
                .build();
        try{
            return identityClient.login(auth);
        } catch (Exception e) {

            e.printStackTrace();
        }
        return null;
    }

    @Override
    public IntrospectResponse introspect(IntrospectRequest request) {
        return identityClient.introspect(request);
    }

    public List<ProfileResponse> getAllProfiles() {
        var profiles = profileRepository.findAll();
        return profiles.stream().map(profileMapper::toProfileResponse).toList();
    }


    @Override
    public ProfileResponse register(RegistrationRequest request, MultipartFile avatar) {
        try {
            var token = identityClient.exchangeToken(TokenExchangeParam.builder()
                    .grant_type("client_credentials")
                    .client_id(clientId)
                    .client_secret(clientSecret)
                    .scope("openid")
                    .build());

            log.info("TokenInfo {}", token);

            // Get userId of keyCloak account
            var creationResponse = identityClient.createUser(
                    "Bearer " + token.getAccessToken(),
                    UserCreationParam.builder()
                            .username(request.getUsername())
                            .firstName(request.getFirstName())
                            .lastName(request.getLastName())
                            .email(request.getEmail())
                            .enabled(true)
                            .emailVerified(false)
                            .credentials(List.of(Credential.builder()
                                    .type("password")
                                    .temporary(false)
                                    .value(request.getPassword())
                                    .build()))
                            .build());

            String userId = extractUserId(creationResponse);
            log.info("UserId {}", userId);

            Role userRole = roleRepository.findByName("USER");

            Profile profile = profileMapper.toProfile(request);
            profile.setUserKeyCloakId(userId);
            profile.setAddress(request.getAddress());
            profile.setRoles(Set.of(userRole));

            if (!avatar.isEmpty()) {
                try {
                    Map res = cloudinary.uploader().upload(avatar.getBytes(), ObjectUtils.asMap("resource_type", "auto"));
                    profile.setAvatar(res.get("secure_url").toString());
                } catch (IOException ex) {
                    return null;
                }
            }


            profile = profileRepository.save(profile);

//            NotificationEvent notificationEvent = NotificationEvent.builder()
//                    .body("Xin chào " + request.getUsername()
//                            + ",\n\nTài khoản của bạn đã được tạo thành công. "
//                            + "Chúc bạn có những trải nghiệm tuyệt vời cùng chúng tôi!\n\n"
//                            + "Trân trọng,\nĐội ngũ hỗ trợ")
//                    .channel("notification")
//                    .subject("🎉 Chúc mừng! Tạo tài khoản thành công")
//                    .recipient(request.getEmail())
//                    .build();


//            kafkaTemplate.send("notification-delivery", notificationEvent);

            return profileMapper.toProfileResponse(profile);
        } catch (FeignException exception) {
            throw errorNormalizer.handleKeyCloakException(exception);
        }
    }

    private String extractUserId(ResponseEntity<?> response) {
        List<String> locationHeader = response.getHeaders().get("Location");
        if (locationHeader == null || locationHeader.isEmpty()) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
        String location = locationHeader.get(0);
        return location.substring(location.lastIndexOf("/") + 1);
    }

    @Override
    public ProfileResponse getProfileByKeyCloakId(String userId) {
        Profile profile = profileRepository.findByUserKeyCloakId(userId)
                .orElseThrow(()-> new AppException(ErrorCode.USER_NOT_EXISTED));
        return profileMapper.toProfileResponse(profile);
    }

    @Override
    public ProfileResponse getProfileById(String id) {
        Profile profile = profileRepository.findById(id)
                .orElseThrow(()-> new AppException(ErrorCode.USER_NOT_EXISTED));
        return profileMapper.toProfileResponse(profile);
    }
}
