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

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class IntrospectService {
    KeyCloakClient keycloakClient;

    public IntrospectResponse introspect(String token) {
        Map<String, String> form = new HashMap<>();
        form.put("token", token);
        form.put("client_id", "ecommer_app");
        form.put("client_secret", "WKnFf5PHkolShqwY8CnVrYP7bHhYph4H");

        return keycloakClient.introspect(form);
    }
}
