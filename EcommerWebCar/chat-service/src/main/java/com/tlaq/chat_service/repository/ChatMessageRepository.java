package com.tlaq.chat_service.repository;

import com.tlaq.chat_service.entity.ChatMessage;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {
    List<ChatMessage> findAllByConversationIdOrderByCreatedDateAsc(String conversationId);

    List<ChatMessage> findAllByConversationIdOrderByCreatedDateDesc(String conversationId);

    @Query("{ 'conversationId': ?0 }")
    List<ChatMessage> findByConversationIdWithPagination(String conversationId, int page, int size);

    long countByConversationId(String conversationId);

    // Tìm tin nhắn cuối cùng của conversation
    @Query("{ 'conversationId': ?0 }")
    ChatMessage findTopByConversationIdOrderByCreatedDateDesc(String conversationId);
}
