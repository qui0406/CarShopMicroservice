package com.tlaq.api_gateway.services.impl;

import com.tlaq.api_gateway.dto.ApiResponse;
import com.tlaq.api_gateway.dto.requests.IntrospectRequest;
import com.tlaq.api_gateway.dto.responses.IntrospectResponse;
import com.tlaq.api_gateway.repositories.AuthClient;
import com.tlaq.api_gateway.services.AuthService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthServiceImpl implements AuthService {
    AuthClient authClientRopository;
    @Override
    public Mono<ApiResponse<IntrospectResponse>> introspect(String token) {
        return authClientRopository.introspect(IntrospectRequest.builder().
                token(token).
                build());
    }
}
