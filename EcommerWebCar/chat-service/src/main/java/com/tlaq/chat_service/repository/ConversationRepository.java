package com.tlaq.chat_service.repository;

import com.tlaq.chat_service.entity.Conversation;
import com.tlaq.chat_service.entity.enums.ConversationStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends MongoRepository<Conversation, String> {
    boolean existsByCustomerId(String customerId);

    Optional<Conversation> findByCustomerId(String customerId);

    List<Conversation> findByStaffIdsContaining(String staffId);

    long countByStatus(ConversationStatus status);

}
