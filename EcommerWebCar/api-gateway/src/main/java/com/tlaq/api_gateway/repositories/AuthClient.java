package com.tlaq.api_gateway.repositories;

import com.tlaq.api_gateway.dto.ApiResponse;
import com.tlaq.api_gateway.dto.requests.IntrospectRequest;
import com.tlaq.api_gateway.dto.responses.IntrospectResponse;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.service.annotation.PostExchange;
import reactor.core.publisher.Mono;

public interface AuthClient {
    @PostExchange(url = "/auth/introspect", contentType = MediaType.APPLICATION_JSON_VALUE)
    Mono<ApiResponse<IntrospectResponse>> introspect(@RequestBody IntrospectRequest request);
}
