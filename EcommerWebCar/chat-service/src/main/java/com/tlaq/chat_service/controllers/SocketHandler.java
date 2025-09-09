package com.tlaq.chat_service.controllers;

import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.annotation.OnConnect;
import com.corundumstudio.socketio.annotation.OnDisconnect;
import com.corundumstudio.socketio.annotation.OnEvent;
import com.tlaq.chat_service.dto.request.IntrospectRequest;
import com.tlaq.chat_service.entity.WebSocketSession;
import com.tlaq.chat_service.service.ConversationService;
import com.tlaq.chat_service.service.IntrospectService;
import com.tlaq.chat_service.service.WebSocketSessionService;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.AccessLevel;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SocketHandler {
    SocketIOServer server;
    WebSocketSessionService webSocketSessionService;
    IntrospectService introspectService;
    ConversationService conversationService;


    @PostConstruct
    public void init() {
        server.addEventListener("join-room", JoinRoomRequest.class, (client, data, ackSender) -> {
            String conversationId = data.getConversationId();
            client.joinRoom(conversationId);
            System.out.println("Client " + client.getSessionId() + " joined room: " + conversationId);
        });

        server.addConnectListener(client ->
                System.out.println("Client connected: " + client.getSessionId())
        );

        server.addDisconnectListener(client ->
                System.out.println("Client disconnected: " + client.getSessionId())
        );
    }

    @Data
    public static class JoinRoomRequest {
        private String conversationId;
    }

    @OnConnect
    public void clientConnected(SocketIOClient client) {
        String token = client.getHandshakeData().getSingleUrlParam("token");

        // Verify token
        var introspectResponse = introspectService.introspect(token);

        log.info("IntrospectResponse: {}", introspectResponse);

        if (introspectResponse.isActive()) {
            log.info("Client connected: {}", client.getSessionId());
            // Persist webSocketSession
            WebSocketSession webSocketSession = WebSocketSession.builder()
                    .socketSessionId(client.getSessionId().toString())
                    .userId(introspectResponse.getSub())
                    .createdAt(Instant.now())
                    .build();
            webSocketSession = webSocketSessionService.create(webSocketSession);

            log.info("WebSocketSession created with id: {}", webSocketSession.getId());
        } else {
            log.error("Authentication fail: {}", client.getSessionId());
            client.disconnect();
        }
    }

    @OnDisconnect
    public void clientDisconnected(SocketIOClient client) {
        log.info("Client disConnected: {}", client.getSessionId());
        webSocketSessionService.deleteSession(client.getSessionId().toString());
    }

    @PostConstruct
    public void startServer() {
        server.start();
        server.addListeners(this);
        log.info("Socket server started");
    }

    @PreDestroy
    public void stopServer() {
        server.stop();
        log.info("Socket server stoped");
    }
}
