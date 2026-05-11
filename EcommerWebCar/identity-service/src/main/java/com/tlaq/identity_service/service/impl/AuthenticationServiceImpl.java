package com.tlaq.identity_service.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.tlaq.identity_service.config.RabbitMQConfig;
import com.tlaq.identity_service.dto.request.*;
import com.tlaq.identity_service.dto.response.*;
import com.tlaq.identity_service.entity.Profile;
import com.tlaq.identity_service.entity.Role;
import com.tlaq.identity_service.event.NotificationEvent;
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
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Slf4j
@Service
public class AuthenticationServiceImpl implements AuthenticationService {
    private static final String ROLE_USER              = "USER";
    private static final String ROLE_STAFF             = "STAFF";
    private static final String CREDENTIAL_TYPE        = "password";
    private static final String GRANT_TYPE_PASSWORD    = "password";
    private static final String GRANT_TYPE_REFRESH     = "refresh_token";
    private static final String GRANT_TYPE_CREDENTIALS = "client_credentials";
    private static final String SCOPE_OPENID           = "openid";

    private final ProfileRepository profileRepository;
    private final ProfileMapper     profileMapper;
    private final KeyCloakClient    identityClient;
    private final ErrorNormalizer   errorNormalizer;
    private final Cloudinary        cloudinary;
    private final RoleRepository    roleRepository;
    private final RabbitTemplate    rabbitTemplate;

    @Value("${idp.client-id}")     private String clientId;
    @Value("${idp.client-secret}") private String clientSecret;

    public AuthenticationServiceImpl(
            ProfileRepository profileRepository,
            ProfileMapper profileMapper,
            KeyCloakClient identityClient,
            ErrorNormalizer errorNormalizer,
            Cloudinary cloudinary,
            RoleRepository roleRepository,
            RabbitTemplate rabbitTemplate) {
        this.profileRepository = profileRepository;
        this.profileMapper = profileMapper;
        this.identityClient = identityClient;
        this.errorNormalizer = errorNormalizer;
        this.cloudinary = cloudinary;
        this.roleRepository = roleRepository;
        this.rabbitTemplate = rabbitTemplate;
    }


    @Override
    @Transactional
    public ProfileResponse register(RegistrationRequest request, MultipartFile avatar) {
        try {
            String adminToken = getAdminToken();
            String userId = createKeycloakUser(adminToken, request.getUsername(),
                    request.getFirstName(), request.getLastName(),
                    request.getEmail(), request.getPassword(), true);

            assignKeycloakRole(adminToken, userId, ROLE_USER);

            Profile profile = profileMapper.toProfile(request);
            profile.setUserKeyCloakId(userId);
            profile.setAddress(request.getAddress());
            profile.setRoles(resolveRoles(ROLE_USER));

            uploadAvatar(avatar, profile);

            ProfileResponse saved = profileMapper.toProfileResponse(profileRepository.save(profile));

            // Publish sự kiện đăng ký tài khoản → notification-service sẽ gửi email chào mừng
            publishUserRegisteredEvent(userId, request.getEmail(), request.getUsername(),
                    request.getFirstName(), request.getLastName());

            return saved;
        } catch (FeignException e) {
            throw errorNormalizer.handleKeyCloakException(e);
        }
    }

    @Override
    @Transactional
    public ProfileResponse createStaff(StaffRegistrationRequest request) {
        try {
            String adminToken = getAdminToken();
            String userId = createKeycloakUser(adminToken, request.getUsername(),
                    request.getFirstName(), request.getLastName(),
                    request.getEmail(), request.getPassword(), true);

            assignKeycloakRole(adminToken, userId, ROLE_STAFF);

            Profile profile = profileMapper.toProfileStaff(request);
            profile.setUserKeyCloakId(userId);
            profile.setRoles(resolveRoles(ROLE_STAFF));

            return profileMapper.toProfileResponse(profileRepository.save(profile));
        } catch (FeignException e) {
            throw errorNormalizer.handleKeyCloakException(e);
        }
    }

    @Override
    public TokenResponse login(LoginRequest request) {
        try {
            return identityClient.login(Authenticated.builder()
                    .client_id(clientId)
                    .client_secret(clientSecret)
                    .grant_type(GRANT_TYPE_PASSWORD)
                    .username(request.getUsername())
                    .password(request.getPassword())
                    .build());
        } catch (FeignException.Unauthorized e) {
            log.error("Keycloak Unauthorized error: {}", e.contentUTF8());
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        } catch (FeignException e) {
            log.error("Feign error: Status {}, Message: {}", e.status(), e.getMessage());
            log.error("Full body: {}", e.contentUTF8());
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }

    @Override
    public IntrospectResponse introspect(IntrospectRequest request) {
        try {
            return identityClient.introspect(buildClientParams(
                    Map.of("token", request.getToken())));
        } catch (Exception e) {
            return IntrospectResponse.builder().isValid(false).build();
        }
    }

    @Override
    public TokenResponse refreshToken(RefreshTokenRequest request) {
        try {
            return identityClient.refreshToken(buildClientParams(
                    Map.of("grant_type", GRANT_TYPE_REFRESH,
                            "refresh_token", request.getRefreshToken())));
        } catch (FeignException.Unauthorized e) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        } catch (FeignException e) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }

    @Override
    public void logout(LogoutRequest request) {
        try {
            identityClient.logout(buildClientParams(
                    Map.of("refresh_token", request.getRefreshToken())));
        } catch (FeignException e) {
            log.error("Logout failed: {}", e.contentUTF8());
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }


    // ── private helpers ──────────────────────────────────────────────────────

    /**
     * Publish NotificationEvent lên RabbitMQ để notification-service gửi email chào mừng.
     * Lỗi publish KHÔNG được phép làm rollback transaction đăng ký.
     */
    private void publishUserRegisteredEvent(String userId, String email,
                                            String username, String firstName, String lastName) {
        try {
            NotificationEvent event = NotificationEvent.builder()
                    .type("USER_REGISTERED")
                    .recipientId(userId)
                    .recipientEmail(email)
                    .templateCode("WELCOME_USER")
                    .subject("Chào mừng bạn đến với EcommerCar!")
                    .body(String.format("Xin chào %s %s, tài khoản của bạn đã được tạo thành công!",
                            firstName, lastName))
                    .param(Map.of(
                            "username",  username,
                            "firstName", firstName,
                            "lastName",  lastName,
                            "email",     email
                    ))
                    .build();

            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.USER_REGISTERED_EXCHANGE,
                    RabbitMQConfig.USER_REGISTERED_ROUTING_KEY,
                    event
            );
            log.info("📤 Đã publish UserRegisteredEvent cho user: {} ({})", userId, email);
        } catch (Exception e) {
            // Không throw — tránh rollback transaction đăng ký khi Rabbit tạm thời lỗi
            log.error("⚠️ Không thể publish UserRegisteredEvent cho user {}: {}", userId, e.getMessage());
        }
    }

    private String createKeycloakUser(String adminToken, String username,
                                      String firstName, String lastName,
                                      String email, String password,
                                      boolean emailVerified) {
        Credential credential = Credential.builder()
                .type(CREDENTIAL_TYPE)
                .temporary(false)
                .value(password)
                .build();

        UserCreationParam param = UserCreationParam.builder()
                .username(username)
                .firstName(firstName)
                .lastName(lastName)
                .email(email)
                .enabled(true)
                .emailVerified(emailVerified)
                .credentials(List.of(credential))
                .build();

        String userId = extractUserId(identityClient.createUser(adminToken, param));
        log.info("Keycloak user created — id: {}", userId);
        return userId;
    }

    /**
     * Fetches the named Keycloak realm role and assigns it to the given user.
     */
    private void assignKeycloakRole(String adminToken, String userId, String roleName) {
        RoleKeycloakResponse role = identityClient.getRoleByName(adminToken, roleName);
        identityClient.assignRole(adminToken, userId, List.of(role));
    }

    /**
     * Resolves a local DB role by name; throws if not found.
     */
    private Set<Role> resolveRoles(String roleName) {
        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_IS_NULL));
        return Set.of(role);
    }

    /**
     * Uploads an avatar to Cloudinary and sets the URL on the profile.
     * Skips silently when {@code avatar} is null or empty.
     */
    private void uploadAvatar(MultipartFile avatar, Profile profile) {
        if (avatar == null || avatar.isEmpty()) return;
        try {
            Map<String, Object> result = cloudinary.uploader()
                    .upload(avatar.getBytes(), ObjectUtils.asMap("resource_type", "auto"));
            profile.setAvatar(result.get("secure_url").toString());
        } catch (IOException e) {
            log.error("Cloudinary upload failed — avatar skipped: {}", e.getMessage());
        }
    }

    /**
     * Exchanges client credentials for an admin Bearer token.
     */
    private String getAdminToken() {
        TokenExchangeResponse token = identityClient.exchangeToken(TokenExchangeParam.builder()
                .grant_type(GRANT_TYPE_CREDENTIALS)
                .client_id(clientId)
                .client_secret(clientSecret)
                .scope(SCOPE_OPENID)
                .build());
        return "Bearer " + token.getAccessToken();
    }


    /**
     * Builds a param map pre-populated with client credentials.
     * Extra entries are merged on top.
     */
    private Map<String, String> buildClientParams(Map<String, String> extras) {
        Map<String, String> params = new HashMap<>();
        params.put("client_id", clientId);
        params.put("client_secret", clientSecret);
        params.putAll(extras);
        return params;
    }

    /**
     * Extracts the Keycloak user ID from the {@code Location} header.
     */
    private String extractUserId(ResponseEntity<?> response) {
        List<String> location = response.getHeaders().get("Location");
        if (location == null || location.isEmpty()) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
        String url = location.get(0);
        return url.substring(url.lastIndexOf('/') + 1);
    }
}