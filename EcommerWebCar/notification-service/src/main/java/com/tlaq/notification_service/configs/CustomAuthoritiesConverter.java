package com.tlaq.notification_service.configs;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


public class CustomAuthoritiesConverter implements Converter<Jwt, Collection<GrantedAuthority>> {
    private final String REALM_ACCESS= "realm_access";
    private final String PREFIX_ROLE="ROLE_";

    @Override
    public Collection<GrantedAuthority> convert(Jwt source) {
        Map<String,Object> realmAccess = source.getClaimAsMap(REALM_ACCESS);

        Object roles = realmAccess.get("roles");
        if(roles instanceof List stringRoles){
            return ((List<String>) stringRoles)
                    .stream()
                    .map(s -> new SimpleGrantedAuthority(String.format("%s%s", PREFIX_ROLE, s)))
                    .collect(Collectors.toList());
        }
        return List.of();
    }
}
