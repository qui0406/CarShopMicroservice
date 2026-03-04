package com.tlaq.cms_service.service;

import com.tlaq.catalog_service.dto.response.IntrospectResponse;
import com.tlaq.catalog_service.repo.httpClient.KeyCloakClient;
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
