package com.tlaq.main_service.configs;

import com.tlaq.main_service.services.KeyCloakTokenService;
import org.springframework.util.StringUtils;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class AuthenticationRequestInterceptor implements RequestInterceptor {
    private final KeyCloakTokenService keyCloakTokenService;

    public AuthenticationRequestInterceptor(KeyCloakTokenService keycloakTokenService) {
        this.keyCloakTokenService = keycloakTokenService;
    }

    @Override
    public void apply(RequestTemplate template) {
        ServletRequestAttributes servletRequestAttributes =
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

        if (servletRequestAttributes != null) {
            var authHeader = servletRequestAttributes.getRequest().getHeader("Authorization");
            if (StringUtils.hasText(authHeader)) {
                log.info("Adding Authorization header from HTTP request: {}", authHeader);
                template.header("Authorization", authHeader);
                return;
            }
            log.warn("No Authorization header found in HTTP request");
        } else {
            log.warn("No ServletRequestAttributes available, fetching Keycloak token");
        }

        try {
            String token = keyCloakTokenService.getAccessToken();
            log.info("Adding Keycloak service account token");
            template.header("Authorization", token);
        } catch (Exception e) {
            log.error("Failed to fetch Keycloak token: {}", e.getMessage(), e);
            throw new RuntimeException("Authentication failed due to token retrieval error", e);
        }
    }
}
