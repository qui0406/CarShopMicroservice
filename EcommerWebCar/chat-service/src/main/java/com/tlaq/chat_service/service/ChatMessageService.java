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
    ObjectMapper objectMapper;
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

        // Kiểm tra quyền truy cập
        validateUserAccessToConversation(conversation, userInfo.getId());

        var messages = chatMessageRepository.findAllByConversationIdOrderByCreatedDateAsc(conversationId);

        return messages.stream()
                .map(message -> toChatMessageResponse(message, userInfo.getId()))
                .toList();
    }

    /**
     * Tạo tin nhắn mới
     */
    public ChatMessageResponse create(ChatMessageRequest request) throws JsonProcessingException {
        String userKeyCloakId = SecurityContextHolder.getContext().getAuthentication().getName();
        var userInfoResponse = mainClient.getProfile(userKeyCloakId);

        if (Objects.isNull(userInfoResponse)) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }

        var userInfo = userInfoResponse.getResult();
        Conversation conversation = conversationRepository.findById(request.getConversationId())
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

        // Kiểm tra quyền gửi tin nhắn
        validateUserAccessToConversation(conversation, userInfo.getId());

        // Auto-assign staff nếu chưa có ai được assign và người gửi là staff
        if (isStaffUser(userInfo.getId(), conversation) &&
                conversation.getStatus() == ConversationStatus.WAITING) {
            autoAssignStaffToConversation(conversation, userInfo.getId());
        }

        // Tạo tin nhắn
        ChatMessage chatMessage = buildChatMessage(request, userInfo);
        chatMessage = chatMessageRepository.save(chatMessage);

        // Update conversation activity
        updateConversationActivity(conversation, request.getMessage());

        // Gửi tin nhắn qua WebSocket
        broadcastMessage(conversation, chatMessage, userInfo.getId());

        return toChatMessageResponse(chatMessage, userInfo.getId());
    }

    /**
     * Kiểm tra quyền truy cập conversation
     */
    private void validateUserAccessToConversation(Conversation conversation, String userId) {
        boolean isCustomer = conversation.getCustomerId().equals(userId);
        boolean isStaff = conversation.getStaffIds().contains(userId);

        if (!isCustomer && !isStaff) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }

    /**
     * Kiểm tra user có phải staff không
     */
    private boolean isStaffUser(String userId, Conversation conversation) {
        return !conversation.getCustomerId().equals(userId);
    }

    /**
     * Auto assign staff vào conversation
     */
    private void autoAssignStaffToConversation(Conversation conversation, String staffId) {
        try {
            // Add staff to conversation if not already added
            if (!conversation.getStaffIds().contains(staffId)) {
                conversation.getStaffIds().add(staffId);
            }

//            // Set as assigned staff if not set
//            if (conversation.getAssignedStaffId() == null) {
//                conversation.setAssignedStaffId(staffId);
//                conversation.setStatus(ConversationStatus.ACTIVE);
//                log.info("Auto-assigned staff {} to conversation {}", staffId, conversation.getId());
//            }

            conversationRepository.save(conversation);
        } catch (Exception e) {
            log.error("Failed to auto-assign staff to conversation: {}", e.getMessage());
        }
    }

    /**
     * Tạo ChatMessage object
     */
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

    /**
     * Update conversation activity
     */
    private void updateConversationActivity(Conversation conversation, String lastMessage) {// Giới hạn độ dài preview
        conversationRepository.save(conversation);
    }

    /**
     * Broadcast tin nhắn qua WebSocket
     */
    private void broadcastMessage(Conversation conversation, ChatMessage chatMessage, String senderId) {
        try {
            // Lấy tất cả user ID cần gửi tin nhắn
            Set<String> recipientIds = new HashSet<>();
            recipientIds.add(conversation.getCustomerId());
            recipientIds.addAll(conversation.getStaffIds());

            // Lấy các WebSocket session đang active
            Map<String, WebSocketSession> webSocketSessions = webSocketSessionRepository
                    .findAllByUserIdIn(new ArrayList<>(recipientIds))
                    .stream()
                    .collect(Collectors.toMap(
                            WebSocketSession::getSocketSessionId,
                            Function.identity()
                    ));

            // Gửi tin nhắn đến tất cả client
            socketIOServer.getAllClients().forEach(client -> {
                try {
                    var webSocketSession = webSocketSessions.get(client.getSessionId().toString());

                    if (Objects.nonNull(webSocketSession)) {
                        ChatMessageResponse response = toChatMessageResponse(chatMessage, webSocketSession.getUserId());
                        response.setConversationId(conversation.getId());
                        String messageJson = objectMapper.writeValueAsString(response);

                        client.sendEvent("message", messageJson);
                        log.debug("Sent message to client: {}", client.getSessionId());
                    }
                } catch (JsonProcessingException e) {
                    log.error("Failed to send message to client {}: {}", client.getSessionId(), e.getMessage());
                }
            });

        } catch (Exception e) {
            log.error("Failed to broadcast message: {}", e.getMessage());
        }
    }


    private ChatMessageResponse toChatMessageResponse(ChatMessage chatMessage, String currentUserId) {
        ChatMessageResponse response = chatMessageMapper.toChatMessageResponse(chatMessage);
        response.setMe(currentUserId.equals(chatMessage.getSender().getId()));
        return response;
    }


    private String truncateMessage(String message, int maxLength) {
        if (message == null) return "";
        return message.length() > maxLength ? message.substring(0, maxLength) + "..." : message;
    }


    public List<ChatMessageResponse> getMessagesWithPagination(String conversationId, int page, int size) {
        String userKeyCloakId = SecurityContextHolder.getContext().getAuthentication().getName();
        var userInfoResponse = mainClient.getProfile(userKeyCloakId);

        if (Objects.isNull(userInfoResponse)) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }

        var userInfo = userInfoResponse.getResult();
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

        validateUserAccessToConversation(conversation, userInfo.getId());

        var messages = chatMessageRepository.findByConversationIdWithPagination(
                conversationId, page, size);

        return messages.stream()
                .map(message -> toChatMessageResponse(message, userInfo.getId()))
                .toList();
    }

    /**
     * Đánh dấu tin nhắn đã đọc (nếu cần implement read status)
     */
    public void markMessagesAsRead(String conversationId) {
        String userKeyCloakId = SecurityContextHolder.getContext().getAuthentication().getName();
        var userInfoResponse = mainClient.getProfile(userKeyCloakId);

        if (Objects.isNull(userInfoResponse)) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }

        var userInfo = userInfoResponse.getResult();
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

        validateUserAccessToConversation(conversation, userInfo.getId());

        // TODO: Implement read status tracking if needed
        log.info("User {} marked messages as read in conversation {}", userInfo.getId(), conversationId);

        // Broadcast read status to other participants
        broadcastReadStatus(conversation, userInfo.getId());
    }

    /**
     * Broadcast read status
     */
    private void broadcastReadStatus(Conversation conversation, String userId) {
        try {
            Set<String> recipientIds = new HashSet<>();
            recipientIds.add(conversation.getCustomerId());
            recipientIds.addAll(conversation.getStaffIds());
            recipientIds.remove(userId); // Không gửi lại cho người đánh dấu

            Map<String, WebSocketSession> webSocketSessions = webSocketSessionRepository
                    .findAllByUserIdIn(new ArrayList<>(recipientIds))
                    .stream()
                    .collect(Collectors.toMap(
                            WebSocketSession::getSocketSessionId,
                            Function.identity()
                    ));

            Map<String, Object> readStatusEvent = Map.of(
                    "conversationId", conversation.getId(),
                    "userId", userId,
                    "readAt", Instant.now().toString()
            );

            socketIOServer.getAllClients().forEach(client -> {
                try {
                    var webSocketSession = webSocketSessions.get(client.getSessionId().toString());

                    if (Objects.nonNull(webSocketSession)) {
                        String eventJson = objectMapper.writeValueAsString(readStatusEvent);
                        client.sendEvent("message", eventJson);
                    }
                } catch (JsonProcessingException e) {
                    log.error("Failed to send read status to client {}: {}", client.getSessionId(), e.getMessage());
                }
            });

        } catch (Exception e) {
            log.error("Failed to broadcast read status: {}", e.getMessage());
        }
    }
}
