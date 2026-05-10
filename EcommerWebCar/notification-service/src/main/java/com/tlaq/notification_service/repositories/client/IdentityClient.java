package com.tlaq.notification_service.repositories.client;

import com.tlaq.notification_service.configs.AuthenticationRequestInterceptor;
import com.tlaq.notification_service.dto.ApiResponse;
import com.tlaq.notification_service.dto.responses.UserProfileResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "identity-service",
        configuration = { AuthenticationRequestInterceptor.class })
public interface IdentityClient {
    @GetMapping("/identity/api/profile/get-profile-by-keycloak-id/{userKeyCloakId}")
    ApiResponse<UserProfileResponse> getProfileByUserKeycloakId(@PathVariable String userKeyCloakId);

    @GetMapping("/identity/api/profile/get-profile-by-id/{id}")
    ApiResponse<UserProfileResponse> getProfileById(@PathVariable String id);
}
