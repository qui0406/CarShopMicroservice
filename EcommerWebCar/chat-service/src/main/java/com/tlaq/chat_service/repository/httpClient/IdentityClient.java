package com.tlaq.chat_service.repository.httpClient;

import com.tlaq.chat_service.configs.AuthenticationRequestInterceptor;
import com.tlaq.chat_service.dto.ApiResponse;
import com.tlaq.chat_service.dto.response.UserProfileResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "identity", url = "${app.services.identity.url}",
        configuration = { AuthenticationRequestInterceptor.class })
public interface IdentityClient {
    @GetMapping("/identity/api/profile/get-profile-by-keycloak-id/{userKeyCloakId}")
    ApiResponse<UserProfileResponse> getProfileByUserKeycloakId(@PathVariable String userKeyCloakId);

    @GetMapping("/identity/api/profile/get-profile-by-id/{id}")
    ApiResponse<UserProfileResponse> getProfileById(@PathVariable String id);
}
