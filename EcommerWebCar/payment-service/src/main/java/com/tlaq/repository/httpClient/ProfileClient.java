package com.tlaq.repository.httpClient;

import com.tlaq.dto.ApiResponse;
import com.tlaq.dto.response.UserProfileResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "main", url = "${app.services.main.url}")
public interface ProfileClient {
    @GetMapping("/profile/get-profile/{userKeyCloakId}")
    ApiResponse<UserProfileResponse> getProfile(@PathVariable String userKeyCloakId);
}
