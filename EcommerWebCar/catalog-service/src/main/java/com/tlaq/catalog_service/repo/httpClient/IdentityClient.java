package com.tlaq.catalog_service.repo.httpClient;

import com.tlaq.catalog_service.config.AuthenticationRequestInterceptor;
import com.tlaq.catalog_service.dto.ApiResponse;
import com.tlaq.catalog_service.dto.response.UserProfileResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "identity", url = "${app.services.identity.url}",
        configuration = { AuthenticationRequestInterceptor.class })
public interface IdentityClient {
    @GetMapping("/auth/api/profile/get-profile-by-keycloak-id/{userKeyCloakId}")
    ApiResponse<UserProfileResponse> getProfileByUserKeycloakId(@PathVariable String userKeyCloakId);

    @GetMapping("/auth/api/profile/get-profile-by-id/{id}")
    ApiResponse<UserProfileResponse> getProfileById(@PathVariable String id);
}
