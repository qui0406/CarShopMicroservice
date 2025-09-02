package com.tlaq.main_service.configs;

import com.tlaq.main_service.dto.keycloak.KeyCloak;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class KeyCloakConfig {
//    @Value("admin-cli")
//    private String adminClientId;
//
//    @Value("WKnFf5PHkolShqwY8CnVrYP7bHhYph4H")
//    private String adminClientSecret;
//
//    private String authServerUrl;
//
//    private String realm;
//
//    @Bean
//    public RestTemplate restTemplate() {
//        return new RestTemplate();
//    }
//
//    @Bean
//    public KeyCloak keyCloak(){
//        return KeyCloak.builder()
//                .clientId(adminClientId)
//                .clientSecret(adminClientSecret)
//                .grantType("client-credentials")
//                .realm(realm)
//                .serverUrl(authServerUrl)
//                .build();
//    }
}
