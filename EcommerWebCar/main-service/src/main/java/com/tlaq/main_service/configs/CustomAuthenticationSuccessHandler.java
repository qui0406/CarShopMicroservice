package com.tlaq.main_service.configs;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.SneakyThrows;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;

import java.io.IOException;

@Configuration
public class CustomAuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    @SneakyThrows
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        HttpSession session = request.getSession();

        String username = authentication.getName();

//        User user = userDetailsService.getUserByUsername(username);

//        if (!user.getRole().equals("ROLE_STAFF")) {
//            response.sendError(HttpServletResponse.SC_FORBIDDEN, "Chỉ STAFF được đăng nhập qua form");
//            return;
//        }

        String token = "jshfjhff";
        session.setAttribute("authToken", token);

        Cookie cookie = new Cookie("AUTH_TOKEN", token);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(24 * 60 * 60);
        response.addCookie(cookie);
        response.sendRedirect("/ScoreManagement/admin/dashboard");
    }
}
