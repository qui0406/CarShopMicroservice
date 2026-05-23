package com.tlaq.api_gateway.configs;

import com.tlaq.api_gateway.repositories.AuthClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.support.WebClientAdapter;
import org.springframework.web.service.invoker.HttpServiceProxyFactory;

import java.util.List;

@Configuration
public class WebClientConfiguration {
    @Value("${app.base-url:http://localhost:8888}")
    private String baseUrl;

    @Bean
    public WebClient webClient() {
        return WebClient.builder()
                .baseUrl(baseUrl)
                .build();
    }

    @Bean
    public AuthClient authClient(@Value("${idp.url}") String idpUrl){
        WebClient webClient = WebClient.builder()
                .baseUrl(idpUrl)
                .build();

        HttpServiceProxyFactory httpServiceProxyFactory = HttpServiceProxyFactory
                .builderFor(WebClientAdapter.create(webClient)).build();

        return httpServiceProxyFactory.createClient(AuthClient.class);
    }

//    @Bean
//    public CorsWebFilter corsWebFilter(){
//        CorsConfiguration corsConfiguration = new CorsConfiguration();
//        corsConfiguration.setAllowedOrigins(List.of("https://anhquicarshop.com", "http://localhost:3000", "http://localhost:8888"));
//        corsConfiguration.setAllowedHeaders(List.of("*"));
//        corsConfiguration.setAllowedMethods(List.of("*"));
//        corsConfiguration.setAllowCredentials(true);
//
//        UrlBasedCorsConfigurationSource urlBasedCorsConfigurationSource = new UrlBasedCorsConfigurationSource();
//        urlBasedCorsConfigurationSource.registerCorsConfiguration("/**", corsConfiguration);
//
//        return new CorsWebFilter(urlBasedCorsConfigurationSource);
//    }

    @Bean
    public org.springframework.web.server.WebFilter privateNetworkAccessFilter() {
        return (exchange, chain) -> {
            exchange.getResponse().getHeaders().add("Access-Control-Allow-Private-Network", "true");
            return chain.filter(exchange);
        };
    }

}
