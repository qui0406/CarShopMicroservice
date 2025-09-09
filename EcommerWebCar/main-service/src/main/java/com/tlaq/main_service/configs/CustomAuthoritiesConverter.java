package com.tlaq.main_service.configs;

import lombok.extern.slf4j.Slf4j;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
public class CustomAuthoritiesConverter implements Converter<Jwt, Collection<GrantedAuthority>> {
    private final String REALM_ACCESS = "realm_access";
    private final String PREFIX_ROLE = "ROLE_";

    @Override
    public Collection<GrantedAuthority> convert(Jwt source) {
        log.info("=== JWT TOKEN DEBUG ===");
        log.info("JWT Subject: {}", source.getSubject());
        log.info("JWT Claims: {}", source.getClaims());

        Map<String, Object> realmAccess = source.getClaimAsMap(REALM_ACCESS);
        log.info("Realm Access: {}", realmAccess);

        if (realmAccess == null) {
            log.warn("No realm_access found in JWT token");
            return List.of();
        }

        Object roles = realmAccess.get("roles");
        log.info("Raw roles object: {}", roles);

        if (roles instanceof List stringRoles) {
            List<GrantedAuthority> authorities = ((List<String>) stringRoles)
                    .stream()
                    .map(s -> {
                        String authority = String.format("%s%s", PREFIX_ROLE, s);
                        log.info("Converting role '{}' to authority '{}'", s, authority);
                        return new SimpleGrantedAuthority(authority);
                    })
                    .collect(Collectors.toList());

            log.info("Final authorities: {}", authorities);
            return authorities;
        }

        log.warn("Roles is not a List instance: {}", roles != null ? roles.getClass() : "null");
        return List.of();

    }


}
