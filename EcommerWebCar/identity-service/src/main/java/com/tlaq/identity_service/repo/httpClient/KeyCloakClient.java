package com.tlaq.identity_service.repo.httpClient;

import com.tlaq.identity_service.dto.request.Authenticated;
import com.tlaq.identity_service.dto.request.IntrospectRequest;
import com.tlaq.identity_service.dto.request.RoleKeycloakRequest;
import com.tlaq.identity_service.dto.request.UserCreationParam;
import com.tlaq.identity_service.dto.response.*;
import feign.QueryMap;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@FeignClient(name = "key-cloak-client", url = "${idp.url}")
public interface KeyCloakClient {
    @PostMapping(
            value = "/realms/anhqui/protocol/openid-connect/token",
            consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    TokenExchangeResponse exchangeToken(@QueryMap TokenExchangeParam param);

    @PostMapping(value = "/admin/realms/anhqui/users", consumes = MediaType.APPLICATION_JSON_VALUE)
    ResponseEntity<?> createUser(@RequestHeader("authorization") String token, @RequestBody UserCreationParam param);

    @PostMapping(value = "/realms/anhqui/protocol/openid-connect/token",
            consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    TokenResponse login(@QueryMap Authenticated request);

    @PostMapping(value = "/realms/anhqui/protocol/openid-connect/token/introspect",
            consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    IntrospectResponse introspect(@QueryMap Map<String, ?> formParams);

    @PostMapping(value = "/realms/anhqui/protocol/openid-connect/token",
            consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    TokenResponse refreshToken(@RequestBody Map<String, ?> map);

    @PostMapping(value = "/realms/anhqui/protocol/openid-connect/logout",
            consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    void logout(@RequestParam Map<String, ?> map);

    @PostMapping(value = "/admin/realms/anhqui/users/{userId}/role-mappings/realm",
            consumes = MediaType.APPLICATION_JSON_VALUE)
    void assignRole(@RequestHeader("Authorization") String token,
                    @PathVariable("userId") String userId,
                    @RequestBody List<RoleKeycloakResponse> roles);

    @GetMapping(value = "/admin/realms/anhqui/roles/{roleName}")
    RoleKeycloakResponse getRoleByName(@RequestHeader("Authorization") String token,
                                       @PathVariable("roleName") String roleName);
}
