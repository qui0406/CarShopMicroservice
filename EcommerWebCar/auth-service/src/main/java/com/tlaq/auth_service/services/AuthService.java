package com.tlaq.auth_service.services;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jwt.SignedJWT;
import com.tlaq.auth_service.dto.requests.AuthenticationRequest;
import com.tlaq.auth_service.dto.requests.IntrospectRequest;
import com.tlaq.auth_service.dto.requests.LogoutRequest;
import com.tlaq.auth_service.dto.requests.RefreshRequest;
import com.tlaq.auth_service.dto.responses.AuthenticationResponse;
import com.tlaq.auth_service.dto.responses.IntrospectResponse;
import com.tlaq.auth_service.entity.User;

import java.text.ParseException;

public interface AuthService {
    IntrospectResponse introspect(IntrospectRequest request);
    SignedJWT verifyToken(String token, boolean isRefresh) throws JOSEException, ParseException;
    AuthenticationResponse authenticate(AuthenticationRequest request);
    String generateToken(User user);
    AuthenticationResponse refreshToken(RefreshRequest request) throws ParseException, JOSEException;
    void logout(LogoutRequest request) throws ParseException, JOSEException;

}
