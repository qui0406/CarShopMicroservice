package com.tlaq.identity_service.controller;

import com.nimbusds.jose.JOSEException;
import com.tlaq.identity_service.dto.ApiResponse;
import com.tlaq.identity_service.dto.request.*;
import com.tlaq.identity_service.dto.response.IntrospectResponse;
import com.tlaq.identity_service.dto.response.ProfileResponse;
import com.tlaq.identity_service.dto.response.TokenResponse;
import com.tlaq.identity_service.service.AuthenticationService;
import com.tlaq.identity_service.service.ProfileService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.text.ParseException;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
@RequestMapping("/api")
public class AuthenticationController {
    AuthenticationService authenticationService;

    @PostMapping("/register")
    public ApiResponse<ProfileResponse> register(@ModelAttribute RegistrationRequest request,
                                                 MultipartFile avatar) {
        return ApiResponse.<ProfileResponse>builder()
                .result(authenticationService.register(request, avatar))
                .build();
    }

    @PostMapping("/create-staff")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<ProfileResponse> createStaff(@RequestBody @Valid StaffRegistrationRequest request) {
        return ApiResponse.<ProfileResponse>builder()
                .result(authenticationService.createStaff(request))
                .build();
    }

    @PostMapping("/login")
    public ApiResponse<TokenResponse> login(@RequestBody LoginRequest request) {
        return ApiResponse.<TokenResponse>builder()
                .result(authenticationService.login(request))
                .build();
    }

    @PostMapping("/introspect")
    public ApiResponse<IntrospectResponse> introspect(@RequestBody IntrospectRequest request) {
        return ApiResponse.<IntrospectResponse>builder()
                .result(authenticationService.introspect(request))
                .build();
    }

    @PostMapping("/refresh")
    ApiResponse<TokenResponse> refresh(@RequestBody RefreshTokenRequest request)
            throws ParseException, JOSEException {
        var result = authenticationService.refreshToken(request);
        return ApiResponse.<TokenResponse>builder().result(result).build();
    }

    @PostMapping("/logout")
    ApiResponse<Void> logout(@RequestBody LogoutRequest request) throws ParseException, JOSEException {
        authenticationService.logout(request);
        return ApiResponse.<Void>builder().build();
    }
}
