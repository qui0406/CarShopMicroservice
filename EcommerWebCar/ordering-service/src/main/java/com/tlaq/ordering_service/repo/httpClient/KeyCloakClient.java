package com.tlaq.ordering_service.repo.httpClient;

import com.tlaq.ordering_service.dto.response.IntrospectResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(name = "key-cloak-client", url = "http://localhost:8180")
public interface KeyCloakClient {

    @PostMapping(
            value = "/realms/anhqui/protocol/openid-connect/token/introspect",
            consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE
    )
    IntrospectResponse introspect(@RequestBody Map<String, ?> formParams);

}
