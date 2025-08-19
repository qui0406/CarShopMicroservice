package com.tlaq.payment_service.services;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Slf4j
@Service
public class KeyCloakTokenService {
    @Value("${idp.client-id}")
    private String clientId;
    @Value("${idp.client-secret}")
    private String clientSecret;
    @Value("${idp.url}")
    private String tokenUrl;

    @Autowired
    private  RestTemplate restTemplate;
    private String cachedToken;
    private long tokenExpiryTime;


    public synchronized String getAccessToken() {
        if (cachedToken != null && System.currentTimeMillis() < tokenExpiryTime) {
            log.info("Using cached Keycloak token");
            return cachedToken;
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "client_credentials");
        body.add("client_id", clientId);
        body.add("client_secret", clientSecret);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(tokenUrl, request, Map.class);
            if (response.getStatusCode().is2xxSuccessful()) {
                cachedToken = "Bearer " + response.getBody().get("access_token");
                long expiresIn = Long.parseLong(response.getBody().get("expires_in").toString()) * 1000 - 60000;
                tokenExpiryTime = System.currentTimeMillis() + expiresIn;
                log.info("Fetched new Keycloak token, expires in {} ms", expiresIn);
                return cachedToken;
            } else {
                throw new RuntimeException("Failed to fetch Keycloak token, status: " + response.getStatusCode() + ", body: " + response.getBody());
            }
        } catch (Exception e) {
            throw new RuntimeException("Error fetching Keycloak token: " + e.getMessage(), e);
        }
    }
}
