package com.tlaq.cms_service.dto.request;


import jakarta.persistence.Column;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NewsRequest {
    String description;
    String title;
    String content;
    @Column(name="created_at")
    LocalDateTime createdAt;
}
