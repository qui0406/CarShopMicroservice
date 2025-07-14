package com.tlaq.auth_service.controllers;

import com.tlaq.auth_service.dto.ApiResponse;
import com.tlaq.auth_service.dto.UserDTO;
import com.tlaq.auth_service.dto.requests.RegistrationRequest;
import com.tlaq.auth_service.dto.requests.UserUpdateRequest;
import com.tlaq.auth_service.dto.responses.RegistrationResponse;
import com.tlaq.auth_service.services.UserService;
import jakarta.validation.Valid;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @GetMapping
    public ApiResponse<List<UserDTO>> getUsers() {
        return ApiResponse.<List<UserDTO>>builder()
                .result(userService.getUsers())
                .build();
    }

    @GetMapping("/{userId}")
    public ApiResponse<UserDTO> getUser(@PathVariable("userId") String userId) {
        return ApiResponse.<UserDTO>builder()
                .result(userService.getUser(userId))
                .build();
    }

    @GetMapping("/my-info")
    public ApiResponse<UserDTO> getMyInfo() {
        return ApiResponse.<UserDTO>builder()
                .result(userService.getMyInfo())
                .build();
    }

    @DeleteMapping("/{userId}")
    public ApiResponse<String> deleteUser(@PathVariable String userId) {
        userService.deleteUser(userId);
        return ApiResponse.<String>builder().result("User has been deleted").build();
    }

    @PutMapping("/{userId}")
    public ApiResponse<UserDTO> updateUser(@PathVariable String userId, @ModelAttribute UserUpdateRequest request) {
        return ApiResponse.<UserDTO>builder()
                .result(userService.updateUser(userId, request))
                .build();
    }
}
