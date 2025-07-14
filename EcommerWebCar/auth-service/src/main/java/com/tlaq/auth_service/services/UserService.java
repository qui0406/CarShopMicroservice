package com.tlaq.auth_service.services;

import com.tlaq.auth_service.dto.UserDTO;
import com.tlaq.auth_service.dto.requests.RegistrationRequest;
import com.tlaq.auth_service.dto.requests.UserUpdateRequest;
import com.tlaq.auth_service.dto.responses.RegistrationResponse;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface UserService {
    RegistrationResponse register(RegistrationRequest request);
    public void deleteUser(String userId);
    UserDTO updateUser(String userId, UserUpdateRequest request);
    List<UserDTO> getUsers();
    UserDTO getUser(String id);
    UserDTO getMyInfo();
}
