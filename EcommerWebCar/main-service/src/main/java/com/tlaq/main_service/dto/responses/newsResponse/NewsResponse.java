package com.tlaq.main_service.dto.responses.newsResponse;

import com.tlaq.main_service.entity.NewsImage;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NewsResponse {
    Long id;
    String description;
    String title;
    String content;
    LocalDateTime createdAt;
    List<String> newImages;
}
