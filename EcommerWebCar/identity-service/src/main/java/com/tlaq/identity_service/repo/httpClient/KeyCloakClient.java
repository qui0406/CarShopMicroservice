package com.tlaq.identity_service.repo.httpClient;

import com.tlaq.identity_service.dto.request.Authenticated;
import com.tlaq.identity_service.dto.request.IntrospectRequest;
import com.tlaq.identity_service.dto.request.UserCreationParam;
import com.tlaq.identity_service.dto.response.IntrospectResponse;
import com.tlaq.identity_service.dto.response.TokenExchangeParam;
import com.tlaq.identity_service.dto.response.TokenExchangeResponse;
import com.tlaq.identity_service.dto.response.TokenResponse;
import feign.QueryMap;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.List;

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
    IntrospectResponse introspect(@RequestBody IntrospectRequest request);
}
