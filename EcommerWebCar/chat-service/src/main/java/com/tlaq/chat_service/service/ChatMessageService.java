package com.tlaq.chat_service.service;

import com.corundumstudio.socketio.SocketIOServer;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tlaq.chat_service.dto.request.ChatMessageRequest;
import com.tlaq.chat_service.dto.response.ChatMessageResponse;
import com.tlaq.chat_service.dto.response.UserProfileResponse;
import com.tlaq.chat_service.entity.ChatMessage;
import com.tlaq.chat_service.entity.Conversation;
import com.tlaq.chat_service.entity.ParticipantInfo;
import com.tlaq.chat_service.entity.WebSocketSession;
import com.tlaq.chat_service.entity.enums.ConversationStatus;
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
import java.util.*;
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
    ChatMessageMapper chatMessageMapper;

    public List<ChatMessageResponse> getMessages(String conversationId) {
        String userKeyCloakId = SecurityContextHolder.getContext().getAuthentication().getName();
        var userInfoResponse = mainClient.getProfile(userKeyCloakId);

        if (Objects.isNull(userInfoResponse)) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }

        var userInfo = userInfoResponse.getResult();
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

        validateUserAccessToConversation(conversation, userInfo.getId());

        var messages = chatMessageRepository.findAllByConversationIdOrderByCreatedDateAsc(conversationId);

        return messages.stream()
                .map(message -> toChatMessageResponse(message, userInfo.getId()))
                .toList();
    }


    public ChatMessageResponse create(ChatMessageRequest request) throws JsonProcessingException {
        String userKeyCloakId = SecurityContextHolder.getContext().getAuthentication().getName();
        var userInfoResponse = mainClient.getProfile(userKeyCloakId);

        if (Objects.isNull(userInfoResponse)) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }

        var userInfo = userInfoResponse.getResult();

        Conversation conversation = conversationRepository.findById(request.getConversationId())
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

        if (isStaffUser(userInfo.getId(), conversation) &&
                conversation.getStatus() == ConversationStatus.WAITING) {
            autoAssignStaffToConversation(conversation, userInfo.getId());
        }

        ChatMessage chatMessage = buildChatMessage(request, userInfo);
        chatMessage = chatMessageRepository.save(chatMessage);
        updateConversationActivity(conversation, request.getMessage());
        broadcastMessageToConversation(conversation, chatMessage, userInfo.getId());

        return toChatMessageResponse(chatMessage, userInfo.getId());
    }


    private void validateUserAccessToConversation(Conversation conversation, String userId) {
        boolean isCustomer = conversation.getCustomerId().equals(userId);
        boolean isStaff = conversation.getStaffIds().contains(userId);

        if (!isCustomer && !isStaff) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }

    private boolean isStaffUser(String userId, Conversation conversation) {
        return !conversation.getCustomerId().equals(userId);
    }


    private void autoAssignStaffToConversation(Conversation conversation, String staffId) {
        try {
            if (!conversation.getStaffIds().contains(staffId)) {
                conversation.getStaffIds().add(staffId);
            }

            conversationRepository.save(conversation);
            log.info("Auto-assigned staff {} to conversation {}", staffId, conversation.getId());
        } catch (Exception e) {
            log.error("Failed to auto-assign staff to conversation: {}", e.getMessage());
        }
    }


    private ChatMessage buildChatMessage(ChatMessageRequest request, UserProfileResponse userInfo) {
        ParticipantInfo sender = ParticipantInfo.builder()
                .id(userInfo.getId())
                .userKeycloakId(userInfo.getUserKeyCloakId())
                .username(userInfo.getUsername())
                .firstName(userInfo.getFirstName())
                .lastName(userInfo.getLastName())
                .avatar(userInfo.getAvatar())
                .build();

        return ChatMessage.builder()
                .conversationId(request.getConversationId())
                .message(request.getMessage())
                .sender(sender)
                .createdDate(Instant.now())
                .build();
    }


    private void updateConversationActivity(Conversation conversation, String lastMessage) {
        try {

            conversationRepository.save(conversation);
        } catch (Exception e) {
            log.error("Failed to update conversation activity: {}", e.getMessage());
        }
    }


    private void broadcastMessageToConversation(Conversation conversation, ChatMessage chatMessage, String senderId) {
        try {
            String conversationRoom = conversation.getId();

            Set<String> participantIds = new HashSet<>();
            participantIds.add(conversation.getCustomerId());
            participantIds.addAll(conversation.getStaffIds());

            socketIOServer.getRoomOperations(conversationRoom).sendEvent("message",
                    toChatMessageResponseMap(chatMessage, conversation.getId()));

            Map<String, WebSocketSession> webSocketSessions = webSocketSessionRepository
                    .findAllByUserIdIn(new ArrayList<>(participantIds))
                    .stream()
                    .collect(Collectors.toMap(
                            WebSocketSession::getSocketSessionId,
                            Function.identity()
                    ));


            socketIOServer.getAllClients().forEach(client -> {
                try {
                    WebSocketSession session = webSocketSessions.get(client.getSessionId().toString());
                    if (session != null) {
                        ChatMessageResponse response = toChatMessageResponse(chatMessage, session.getUserId());
                        response.setConversationId(conversation.getId());

                        client.sendEvent("message", response);
                    }
                } catch (Exception e) {
                    log.error("Failed to send message to client {}: {}",
                            client.getSessionId(), e.getMessage());
                }
            });

        } catch (Exception e) {
            log.error("Failed to broadcast message: {}", e.getMessage(), e);
        }
    }


    private Map<String, Object> toChatMessageResponseMap(ChatMessage chatMessage, String conversationId) {
        try {
            Map<String, Object> response = new HashMap<>();
            response.put("id", chatMessage.getId());
            response.put("conversationId", conversationId);
            response.put("message", chatMessage.getMessage());
            response.put("createdDate", chatMessage.getCreatedDate().toString());

            Map<String, Object> senderInfo = new HashMap<>();
            senderInfo.put("id", chatMessage.getSender().getId());
            senderInfo.put("name", chatMessage.getSender().getFirstName() + " " + chatMessage.getSender().getLastName());
            senderInfo.put("username", chatMessage.getSender().getUsername());
            senderInfo.put("avatar", chatMessage.getSender().getAvatar());
            response.put("sender", senderInfo);

            return response;
        } catch (Exception e) {
            log.error("Error converting message to response map: {}", e.getMessage());
            return new HashMap<>();
        }
    }

    private ChatMessageResponse toChatMessageResponse(ChatMessage chatMessage, String currentUserId) {
        ChatMessageResponse response = chatMessageMapper.toChatMessageResponse(chatMessage);
        response.setMe(currentUserId.equals(chatMessage.getSender().getId()));
        return response;
    }
}
