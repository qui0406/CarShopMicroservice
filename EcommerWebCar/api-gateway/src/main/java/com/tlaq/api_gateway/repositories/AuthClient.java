package com.tlaq.api_gateway.repositories;

import com.tlaq.api_gateway.dto.ApiResponse;
import com.tlaq.api_gateway.dto.requests.IntrospectRequest;
import com.tlaq.api_gateway.dto.responses.IntrospectResponse;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Repository;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.service.annotation.HttpExchange;
import org.springframework.web.service.annotation.PostExchange;
import reactor.core.publisher.Mono;

@HttpExchange("http://localhost:8180")
public interface AuthClient {
    @PostExchange(url = "/realms/anhqui/protocol/openid-connect/token/introspect",
            contentType = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    Mono<IntrospectResponse> introspect(@RequestBody MultiValueMap<String, String> formData);
}
