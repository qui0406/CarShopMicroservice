package com.tlaq.ordering_service.repo.httpClient;

import com.tlaq.ordering_service.config.AuthenticationRequestInterceptor;
import com.tlaq.ordering_service.dto.ApiResponse;
import com.tlaq.ordering_service.dto.response.UserProfileResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "identity-service", url = "${app.services.main.url}",
        configuration = { AuthenticationRequestInterceptor.class })
public interface IdentityClient {
    @GetMapping("/api/profile/get-profile/{userKeyCloakId}")
    ApiResponse<UserProfileResponse> getProfile(@PathVariable String userKeyCloakId);

    @GetMapping("/api/profile/get-profile-by-id/{id}")
    ApiResponse<UserProfileResponse> getProfileById(@PathVariable String id);
}