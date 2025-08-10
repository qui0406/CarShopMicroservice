package com.tlaq.main_service.repositories.httpClient;

import com.tlaq.main_service.dto.identity.TokenExchangeParam;
import com.tlaq.main_service.dto.identity.TokenExchangeResponse;
import com.tlaq.main_service.dto.identity.UserCreationParam;
import feign.QueryMap;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "key-cloak-client", url = "${idp.url}")
public interface KeyCloakClient {
    @PostMapping(
            value = "/realms/anhqui/protocol/openid-connect/token",
            consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    TokenExchangeResponse exchangeToken(@QueryMap TokenExchangeParam param);

    @PostMapping(value = "/admin/realms/anhqui/users", consumes = MediaType.APPLICATION_JSON_VALUE)
    ResponseEntity<?> createUser(@RequestHeader("authorization") String token, @RequestBody UserCreationParam param);
}
