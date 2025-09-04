package com.tlaq.chat_service.entity;

import com.tlaq.chat_service.entity.enums.ConversationStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "conversation")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Conversation {
    @MongoId
    String id;

    @Indexed(unique = true)
    String customerId;

    ParticipantInfo customerInfo;

    List<String> staffIds;

    ConversationStatus status;

    Instant createdAt;
}
