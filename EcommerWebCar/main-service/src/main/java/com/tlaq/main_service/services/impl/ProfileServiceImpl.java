package com.tlaq.main_service.services.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.tlaq.event.dto.NotificationEvent;
import com.tlaq.main_service.dto.keycloak.*;
import com.tlaq.main_service.dto.requests.RegistrationRequest;
import com.tlaq.main_service.dto.responses.IntrospectResponse;
import com.tlaq.main_service.dto.responses.ProfileResponse;
import com.tlaq.main_service.dto.responses.TokenResponse;
import com.tlaq.main_service.entity.Profile;
import com.tlaq.main_service.exceptions.AppException;
import com.tlaq.main_service.exceptions.ErrorCode;
import com.tlaq.main_service.exceptions.ErrorNormalizer;
import com.tlaq.main_service.mapper.ProfileMapper;
import com.tlaq.main_service.repositories.ProfileRepository;
import com.tlaq.main_service.repositories.httpClient.KeyCloakClient;
import com.tlaq.main_service.services.ProfileService;
import feign.FeignException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

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
    KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${idp.client-id}")
    @NonFinal
    String clientId;

    @Value("${idp.client-secret}")
    @NonFinal
    String clientSecret;

    public ProfileResponse getMyProfile() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();

        var profile = profileRepository.findByUserKeyCloakId(userId).orElseThrow(
                () -> new AppException(ErrorCode.USER_NOT_EXISTED));

        log.info("hfshaf :{}",profile.getUserKeyCloakId());

        return profileMapper.toProfileResponse(profile);
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
        return identityClient.login(auth);
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
            // Create user with client Token and given info

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



            var profile = profileMapper.toProfile(request);
            profile.setUserKeyCloakId(userId);
            profile.setAddress(request.getAddress());

            if (!avatar.isEmpty()) {
                try {
                    Map res = cloudinary.uploader().upload(avatar.getBytes(), ObjectUtils.asMap("resource_type", "auto"));
                    profile.setAvatar(res.get("secure_url").toString());
                } catch (IOException ex) {
                    return null;
                }
            }


            profile = profileRepository.save(profile);

            NotificationEvent notificationEvent= NotificationEvent.builder()
                    .body("Tao tai khoan thanh cong")
                    .channel("notification")
                    .subject("Tao tai khoan thanh cong")
                    .recipient(request.getEmail())
                    .build();

            kafkaTemplate.send("notification-delivery", notificationEvent);

            ProfileResponse profileResponse = profileMapper.toProfileResponse(profile);

            return profileResponse;
        } catch (FeignException exception) {
            throw errorNormalizer.handleKeyCloakException(exception);
        }
    }

    private String extractUserId(ResponseEntity<?> response) {
        String location = response.getHeaders().get("Location").getFirst();
        String[] splitedStr = location.split("/");
        return splitedStr[splitedStr.length - 1];
    }

    @Override
    public ProfileResponse getProfileByKeyCloakId(String userId) {
        Profile profile = profileRepository.findByUserKeyCloakId(userId)
                .orElseThrow(()-> new AppException(ErrorCode.USER_NOT_EXISTED));
        return profileMapper.toProfileResponse(profile);
    }
}
