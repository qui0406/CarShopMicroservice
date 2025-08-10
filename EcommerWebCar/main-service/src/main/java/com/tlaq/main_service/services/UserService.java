package com.tlaq.main_service.services;

import com.tlaq.main_service.dto.UserDTO;
import com.tlaq.main_service.dto.requests.RegistrationRequest;
import com.tlaq.main_service.dto.requests.UserUpdateRequest;
import com.tlaq.main_service.dto.responses.RegistrationResponse;

import java.util.List;

public interface UserService {
    RegistrationResponse register(RegistrationRequest request);
    public void deleteUser(String userId);
    UserDTO updateUser(String userId, UserUpdateRequest request);
    List<UserDTO> getUsers();
    UserDTO getUser(String id);
    UserDTO getMyInfo();
}
