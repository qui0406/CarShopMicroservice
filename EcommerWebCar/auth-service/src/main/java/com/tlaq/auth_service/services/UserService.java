package com.tlaq.auth_service.services;

import com.tlaq.auth_service.dto.requests.RegistrationRequest;
import com.tlaq.auth_service.dto.responses.RegistrationResponse;
import org.springframework.http.ResponseEntity;

public interface UserService {
    RegistrationResponse register(RegistrationRequest request);
}
