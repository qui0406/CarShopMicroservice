package com.tlaq.main_service.configs;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.config.annotation.authentication.configuration.EnableGlobalAuthentication;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;


@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@Slf4j
public class SecurityConfigs  {
    private static final String[] PUBLIC_ENDPOINTS = {
            "/profile/register", "/profile/login", "/car/**",
            "/car-category/**", "car-branch/**", "/car-model/**",
            "/inventory/**"
    };

    private static final String[] STAFF_ENDPOINTS = {
            "/inventory/staff/**", "/orders/staff/**", "/staff/**"
    };

    private static final String[] ADMIN_ENDPOINTS = {
        "/admin/**"
    };

    @Autowired
    private CustomAuthenticationSuccessHandler successHandler;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity
                .authorizeHttpRequests(request -> request
                        .requestMatchers(PUBLIC_ENDPOINTS).permitAll()
                        .requestMatchers(STAFF_ENDPOINTS).access((authentication,
                                                                  context) -> {
                            boolean hasStaffRole = authentication.get().getAuthorities().stream()
                                    .anyMatch(auth ->
                                            auth.getAuthority().equals("ROLE_STAFF") ||
                                            auth.getAuthority().equals("ROLE_ADMIN"));
                            return new AuthorizationDecision(hasStaffRole);
                        })
                        .requestMatchers(ADMIN_ENDPOINTS).access(((authentication, context) ->{
                            boolean hasStaffRole = authentication.get().getAuthorities().stream()
                                    .anyMatch(auth ->
                                            auth.getAuthority().equals("ROLE_ADMIN"));
                            return new AuthorizationDecision(hasStaffRole);
                        }))
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwtConfigurer -> jwtConfigurer
                                .jwtAuthenticationConverter(jwtAuthenticationConverter())
                        )
                        .authenticationEntryPoint(new JwtAuthenticationEntryPoint())
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .formLogin(form -> form
                        .loginPage("/admin/login")
                        .loginProcessingUrl("http://localhost:8888/api/v1/ecommer-car-web/admin/dashboard")
                        .defaultSuccessUrl("http://localhost:8888/api/v1/ecommer-car-web/admin/dashboard", true)
                        .failureUrl("/admin/login?error=true")
                        .permitAll()
                )
                .logout(logout -> logout
                        .logoutSuccessUrl("/admin/login?logout=true")
                        .permitAll()
                )
                .csrf(AbstractHttpConfigurer::disable);

        return httpSecurity.build();
    }


    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(new CustomAuthoritiesConverter());
        return jwtAuthenticationConverter;
    }


    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
