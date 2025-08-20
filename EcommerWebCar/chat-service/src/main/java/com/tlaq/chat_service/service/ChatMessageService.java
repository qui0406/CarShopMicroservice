package com.tlaq.chat_service.service;

import com.corundumstudio.socketio.SocketIOServer;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tlaq.chat_service.dto.request.ChatMessageRequest;
import com.tlaq.chat_service.dto.response.ChatMessageResponse;
import com.tlaq.chat_service.entity.ChatMessage;
import com.tlaq.chat_service.entity.Conversation;
import com.tlaq.chat_service.entity.ParticipantInfo;
import com.tlaq.chat_service.entity.WebSocketSession;
import com.tlaq.chat_service.exceptions.AppException;
import com.tlaq.chat_service.exceptions.ErrorCode;
import com.tlaq.chat_service.mapper.ChatMessageMapper;
import com.tlaq.chat_service.repository.ChatMessageRepository;
import com.tlaq.chat_service.repository.ConversationRepository;
import com.tlaq.chat_service.repository.WebSocketSessionRepository;
import com.tlaq.chat_service.repository.httpClient.MainClient;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ChatMessageService {
    SocketIOServer socketIOServer;

    ChatMessageRepository chatMessageRepository;
    ConversationRepository conversationRepository;
    WebSocketSessionRepository webSocketSessionRepository;
    MainClient mainClient;

    ObjectMapper objectMapper;
    ChatMessageMapper chatMessageMapper;

    public List<ChatMessageResponse> getMessages(String conversationId) {
        // Validate conversationId
        String userKeyCloakId = SecurityContextHolder.getContext().getAuthentication().getName();
        conversationRepository.findById(conversationId)
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND))
                .getParticipants()
                .stream()
                .filter(participantInfo -> userKeyCloakId.equals(participantInfo.getId()))
                .findAny()
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

        var messages = chatMessageRepository.findAllByConversationIdOrderByCreatedDateDesc(conversationId);

        return messages.stream().map(this::toChatMessageResponse).toList();
    }

    public ChatMessageResponse create(ChatMessageRequest request) throws JsonProcessingException {
        String userKeyCloakId = SecurityContextHolder.getContext().getAuthentication().getName();

        String userId= mainClient.getProfile(userKeyCloakId).getResult().getId();

        Conversation conversation = conversationRepository.findById(request.getConversationId())
                .orElseThrow(()-> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));


        conversation.getParticipants()
                .stream()
                .filter(participantInfo -> userId.equals(participantInfo.getId()))
                .findAny()
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

        // Get UserInfo from ProfileService
        var userResponse = mainClient.getProfile(userKeyCloakId);
        if (Objects.isNull(userResponse)) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
        var userInfo = userResponse.getResult();

        // Build Chat message Info
        ChatMessage chatMessage = chatMessageMapper.toChatMessage(request);
        chatMessage.setSender(ParticipantInfo.builder()
                        .id(userInfo.getId())
                        .username(userInfo.getUsername())
                        .firstName(userInfo.getFirstName())
                        .lastName(userInfo.getLastName())
                        .avatar(userInfo.getAvatar())
                .build());
        chatMessage.setCreatedDate(Instant.now());

        // Create chat message
        chatMessage = chatMessageRepository.save(chatMessage);

        // Publish socket event to clients is conversation
        // Get participants userIds;
        List<String> userIds = conversation.getParticipants().stream()
                .map(ParticipantInfo::getId).toList();

        Map<String, WebSocketSession> webSocketSessions =
                webSocketSessionRepository
                        .findAllByUserIdIn(userIds).stream()
                        .collect(Collectors.toMap(
                                WebSocketSession::getSocketSessionId,
                                Function.identity()));

        ChatMessageResponse chatMessageResponse = chatMessageMapper.toChatMessageResponse(chatMessage);
        socketIOServer.getAllClients().forEach(client -> {
            var webSocketSession = webSocketSessions.get(client.getSessionId().toString());

            if (Objects.nonNull(webSocketSession)) {
                String message = null;
                try {
                    chatMessageResponse.setMe(webSocketSession.getUserId().equals(userKeyCloakId));
                    message = objectMapper.writeValueAsString(chatMessageResponse);
                    client.sendEvent("message", message);
                } catch (JsonProcessingException e) {
                    throw new RuntimeException(e);
                }
            }
        });

        // convert to Response
        return toChatMessageResponse(chatMessage);
    }

    private ChatMessageResponse toChatMessageResponse(ChatMessage chatMessage) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        var chatMessageResponse = chatMessageMapper.toChatMessageResponse(chatMessage);
        chatMessageResponse.setMe(userId.equals(chatMessage.getSender().getId()));
        return chatMessageResponse;
    }
}
