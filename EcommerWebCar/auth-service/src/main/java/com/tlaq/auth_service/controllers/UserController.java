package com.tlaq.auth_service.controllers;

import com.tlaq.auth_service.dto.ApiResponse;
import com.tlaq.auth_service.dto.requests.RegistrationRequest;
import com.tlaq.auth_service.dto.responses.RegistrationResponse;
import com.tlaq.auth_service.services.UserService;
import jakarta.validation.Valid;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserController {
    UserService userService;

    @PostMapping(value ="/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponse<RegistrationResponse>
        register(@ModelAttribute @Valid RegistrationRequest request) {
            return ApiResponse.<RegistrationResponse>builder()
                .result(userService.register(request))
                .build();
    }
}
