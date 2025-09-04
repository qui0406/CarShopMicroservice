package com.tlaq.chat_service.dto.response;

import com.tlaq.chat_service.entity.ParticipantInfo;
import com.tlaq.chat_service.entity.enums.ConversationStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ConversationResponse {
    String id;
    String customerId;
    ParticipantInfo customerInfo;

    List<ParticipantInfo> staff;
    ConversationStatus status;

    Instant createdAt;
}
