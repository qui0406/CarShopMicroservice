package com.tlaq.identity_service.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.tlaq.identity_service.dto.request.*;
import com.tlaq.identity_service.dto.response.*;
import com.tlaq.identity_service.entity.Profile;
import com.tlaq.identity_service.entity.Role;
import com.tlaq.identity_service.exception.AppException;
import com.tlaq.identity_service.exception.ErrorCode;
import com.tlaq.identity_service.exception.ErrorNormalizer;
import com.tlaq.identity_service.mapper.ProfileMapper;
import com.tlaq.identity_service.repo.ProfileRepository;
import com.tlaq.identity_service.repo.RoleRepository;
import com.tlaq.identity_service.repo.httpClient.KeyCloakClient;
import com.tlaq.identity_service.service.AuthenticationService;
import feign.FeignException;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationServiceImpl implements AuthenticationService {
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

    @Override
    @Transactional
    public ProfileResponse register(RegistrationRequest request, MultipartFile avatar) {
        try {
            // 1. Lấy Admin Token để gọi API quản trị của Keycloak
            var token = identityClient.exchangeToken(TokenExchangeParam.builder()
                    .grant_type("client_credentials")
                    .client_id(clientId)
                    .client_secret(clientSecret)
                    .scope("openid")
                    .build());
            String adminToken = "Bearer " + token.getAccessToken();

            // 2. Tạo User trên Keycloak
            var creationResponse = identityClient.createUser(adminToken,
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
            log.info("Keycloak User Created with ID: {}", userId);

            // 3. ĐỒNG BỘ ROLE: Lấy ID Role "USER" từ Keycloak và gán cho User mới [cite: 2026-03-05]
            RoleKeycloakResponse roleInfo = identityClient.getRoleByName(adminToken, "USER");
            identityClient.assignRole(adminToken, userId, List.of(roleInfo));

            // 4. Tạo Profile dưới Database local
            Profile profile = profileMapper.toProfile(request);
            profile.setUserKeyCloakId(userId);
            profile.setAddress(request.getAddress());

            // Lưu Role cục bộ để khớp với Keycloak (nếu Quí vẫn muốn quản lý Role ở DB)
            Role userRole = roleRepository.findByName("USER");
            profile.setRoles(Set.of(userRole));

            // 5. Xử lý Avatar với Cloudinary
            if (avatar != null && !avatar.isEmpty()) {
                try {
                    Map res = cloudinary.uploader().upload(avatar.getBytes(),
                            ObjectUtils.asMap("resource_type", "auto"));
                    profile.setAvatar(res.get("secure_url").toString());
                } catch (IOException ex) {
                    log.error("Cloudinary upload failed: {}", ex.getMessage());
                    // Quí có thể ném lỗi hoặc để avatar mặc định
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

    @Override
    @Transactional
    public ProfileResponse createStaff(StaffRegistrationRequest request) {
        try {
            // 1. Lấy Admin Token (Client Credentials) để có quyền quản trị Keycloak
            var token = identityClient.exchangeToken(TokenExchangeParam.builder()
                    .grant_type("client_credentials")
                    .client_id(clientId)
                    .client_secret(clientSecret)
                    .scope("openid")
                    .build());
            String adminToken = "Bearer " + token.getAccessToken();

            // 2. Tạo User trên Keycloak
            var creationResponse = identityClient.createUser(adminToken,
                    UserCreationParam.builder()
                            .username(request.getUsername())
                            .firstName(request.getFirstName())
                            .lastName(request.getLastName())
                            .email(request.getEmail())
                            .enabled(true)
                            .emailVerified(true) // Nhân viên thường được xác thực email sẵn
                            .credentials(List.of(Credential.builder()
                                    .type("password")
                                    .temporary(false)
                                    .value(request.getPassword())
                                    .build()))
                            .build());

            String userId = extractUserId(creationResponse);
            log.info("Keycloak Staff User Created with ID: {}", userId);

            // 3. ĐỒNG BỘ ROLE STAFF: Lấy ID của Role "STAFF" từ Keycloak
            // Lưu ý: Quí phải đảm bảo đã tạo Role tên "STAFF" trên Keycloak Admin Console trước.
            RoleKeycloakResponse roleInfo = identityClient.getRoleByName(adminToken, "STAFF");

            // 4. Gán Role STAFF cho User vừa tạo trên Keycloak
            identityClient.assignRole(adminToken, userId, List.of(roleInfo));

            // 5. Tạo và Lưu Profile xuống Database local (MySQL)
            Profile profile = profileMapper.toProfileStaff(request);
            profile.setUserKeyCloakId(userId);

            // Lấy Role STAFF từ DB local để lưu vào bảng trung gian profile_roles
            Role staffRole = roleRepository.findByName("STAFF");
            if (staffRole == null) {
                // Nếu chưa có trong DB local, hãy tạo mới hoặc ném lỗi
                throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
            }
            profile.setRoles(Set.of(staffRole));

            profile = profileRepository.save(profile);

            log.info("Staff Profile saved to local DB for username: {}", request.getUsername());
            return profileMapper.toProfileResponse(profile);

        } catch (FeignException exception) {
            log.error("Error during staff creation in Keycloak: {}", exception.contentUTF8());
            throw errorNormalizer.handleKeyCloakException(exception);
        }
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
        try {
            return identityClient.login(auth);
        } catch (FeignException.Unauthorized e) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        } catch (Exception e) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }

    @Override
    public IntrospectResponse introspect(IntrospectRequest request) {
        Map<String, String> formParams = new HashMap<>();
        formParams.put("token", request.getToken());
        formParams.put("client_id", clientId);
        formParams.put("client_secret", clientSecret);
        try {
            return identityClient.introspect(formParams);
        } catch (Exception e) {
            return IntrospectResponse.builder().isValid(false).build();
        }
    }

    @Override
    public TokenResponse refreshToken(RefreshTokenRequest request) {
        Map<String, String> map = new HashMap<>();
        map.put("grant_type", "refresh_token");
        map.put("refresh_token", request.getRefreshToken());
        map.put("client_id", clientId);
        map.put("client_secret", clientSecret);

        try {
            return identityClient.refreshToken(map);
        } catch (FeignException.Unauthorized e) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        } catch (Exception e) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }

    @Override
    public void logout(LogoutRequest request) {
        Map<String, String> map = new HashMap<>();
        map.put("refresh_token", request.getRefreshToken());
        map.put("client_id", clientId);
        map.put("client_secret", clientSecret);

        try {
            identityClient.logout(map);
        } catch (Exception e) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
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
}
