package com.tlaq.main_service.services;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jwt.SignedJWT;
import com.tlaq.main_service.dto.identity.AuthenticationRequest;
import com.tlaq.main_service.dto.identity.IntrospectRequest;
import com.tlaq.main_service.dto.requests.LogoutRequest;
import com.tlaq.main_service.dto.requests.RefreshRequest;
import com.tlaq.main_service.dto.responses.AuthenticationResponse;
import com.tlaq.main_service.dto.responses.IntrospectResponse;
import com.tlaq.main_service.entity.User;

import java.text.ParseException;

public interface AuthService {
    IntrospectResponse introspect(IntrospectRequest request);
    SignedJWT verifyToken(String token, boolean isRefresh) throws JOSEException, ParseException;
    AuthenticationResponse authenticate(AuthenticationRequest request);
    String generateToken(User user);
    AuthenticationResponse refreshToken(RefreshRequest request) throws ParseException, JOSEException;
    void logout(LogoutRequest request) throws ParseException, JOSEException;

}
