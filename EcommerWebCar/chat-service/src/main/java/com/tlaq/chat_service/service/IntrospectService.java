package com.tlaq.chat_service.service;

import com.tlaq.chat_service.dto.request.IntrospectRequest;
import com.tlaq.chat_service.dto.response.IntrospectResponse;
import com.tlaq.chat_service.repository.httpClient.KeyCloakClient;
import com.tlaq.chat_service.repository.httpClient.MainClient;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class IntrospectService {
    KeyCloakClient keycloakClient;

    public IntrospectResponse introspect(IntrospectRequest introspectRequest) {
        return keycloakClient.introspect(introspectRequest);
    }
}
