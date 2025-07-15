package com.tlaq.api_gateway.services;

import com.tlaq.api_gateway.dto.ApiResponse;
import com.tlaq.api_gateway.dto.responses.IntrospectResponse;
import reactor.core.publisher.Mono;

public interface AuthService {
    Mono<ApiResponse<IntrospectResponse>> introspect(String token);
}
