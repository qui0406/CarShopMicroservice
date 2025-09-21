package com.tlaq.main_service.configs;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.config.annotation.authentication.configuration.EnableGlobalAuthentication;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;


@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@Slf4j
public class SecurityConfigs  {
    private static final String[] PUBLIC_ENDPOINTS = {
            "/api/profile/register", "/api/profile/login", "/api/car/**",
            "/api/car-category/**", "/api/car-branch/**", "/api/car-model/**",
            "/api/inventory/**"
    };

    private static final String[] STAFF_ENDPOINTS = {
            "/api/inventory/staff/**", "/api/orders/staff/**", "/api/staff/**"
    };

    private static final String[] ADMIN_ENDPOINTS = {
        "/admin/**"
    };

    @Bean
    public UserDetailsService userDetailsService() {
        UserDetails user = User.withUsername("admin")
                .password(passwordEncoder().encode("123456"))
                .roles("ADMIN")
                .build();
        return new InMemoryUserDetailsManager(user);
    }


    @Autowired
    CustomAuthenticationSuccessHandler successHandler;

    @Bean
    @Order(1)
    public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity
                .securityMatcher("/api/**")
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

    @Bean
    @Order(2)
    public SecurityFilterChain webSecurityFilterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity
                .securityMatcher("/admin/**", "/login", "/dashboard", "/logout")
                .authorizeHttpRequests(request -> request
                        .requestMatchers("/login").permitAll()
                        .requestMatchers("/admin/**").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .formLogin(form -> form
                        .loginPage("/login")
                        .defaultSuccessUrl("/admin/dashboard", true)
                        .failureUrl("/login?error=true").permitAll()
                        .permitAll()
                )
                .logout(logout -> logout
                        .logoutSuccessUrl("/login?logout=true")
                        .permitAll()
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                )
                .csrf(AbstractHttpConfigurer::disable);

        return httpSecurity.build();
    }

}
