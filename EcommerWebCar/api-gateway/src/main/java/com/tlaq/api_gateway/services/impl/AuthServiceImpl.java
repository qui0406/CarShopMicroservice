package com.tlaq.api_gateway.services.impl;

import com.tlaq.api_gateway.dto.ApiResponse;
import com.tlaq.api_gateway.dto.requests.IntrospectRequest;
import com.tlaq.api_gateway.dto.responses.IntrospectResponse;
import com.tlaq.api_gateway.repositories.AuthClient;
import com.tlaq.api_gateway.services.AuthService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthServiceImpl implements AuthService {
    @Value("${idp.client-id}")
    @NonFinal
    String clientId;

    @Value("${idp.client-secret}")
    @NonFinal
    String clientSecret;

    AuthClient authClientRepository;

    @Override
    public Mono<IntrospectResponse> introspect(String token) {
        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        formData.add("token", token);
        formData.add("client_id", clientId);
        formData.add("client_secret", clientSecret);

        return authClientRepository.introspect(formData);
    }
}
