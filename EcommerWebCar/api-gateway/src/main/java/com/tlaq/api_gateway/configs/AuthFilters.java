package com.tlaq.api_gateway.configs;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tlaq.api_gateway.dto.ApiResponse;
import com.tlaq.api_gateway.dto.responses.IntrospectResponse;
import com.tlaq.api_gateway.services.AuthService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.Arrays;
import java.util.List;

@Component
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PACKAGE, makeFinal = true)
public class AuthFilters implements GlobalFilter, Ordered {
    AuthService authService;
    ObjectMapper objectMapper;

    @NonFinal
    private static final String[] PUBLIC_ENDPOINTS = {
        "/ecommer-car-web/api/profile/register", "/ecommer-car-web/api/profile/login",
        "/payment/api/checkout/vnpay_ipn", "/ecommer-car-web/api/car/.*",
        "/ecommer-car-web/api/car-model/.*", "/ecommer-car-web/api/car-branch/.*",
        "/ecommer-car-web/api/car-category/.*", "/ecommer-car-web/admin/.*",
            "/ecommer-car-web/api/inventory/.*", "/payment/api/stats/.*"
    };

    @Value("${app.api-prefix}")
    @NonFinal
    private String apiPrefix;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        log.info("Enter authentication filter....");

        if (isPublicEndpoint(exchange.getRequest()))
            return chain.filter(exchange);

        List<String> authHeader = exchange.getRequest().getHeaders().get(HttpHeaders.AUTHORIZATION);
        if (CollectionUtils.isEmpty(authHeader))
            return unauthenticated(exchange.getResponse());

        String token = authHeader.getFirst().replace("Bearer ", "");
        log.info("Token: {}", token);


        return authService.introspect(token).flatMap(introspectResponse -> {
            if (introspectResponse.isActive())
                return chain.filter(exchange);
            else
                return unauthenticated(exchange.getResponse());
        }).onErrorResume(throwable -> unauthenticated(exchange.getResponse()));
    }

    @Override
    public int getOrder() {
        return -1;
    }

    Mono<Void> unauthenticated(ServerHttpResponse response){
        ApiResponse<?> apiResponse = ApiResponse.builder()
            .code(1401)
            .message("Unauthenticated")
            .build();

        String body = null;
        try {
            body = objectMapper.writeValueAsString(apiResponse);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }

        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().add(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE);

        return response.writeWith(
                Mono.just(response.bufferFactory().wrap(body.getBytes())));
    }

    private boolean isPublicEndpoint(ServerHttpRequest request){
        return Arrays.stream(PUBLIC_ENDPOINTS)
                .anyMatch(s -> request.getURI().getPath().matches(apiPrefix + s));
    }
}
