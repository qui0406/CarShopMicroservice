package com.tlaq.main_service.dto.requests.ratingRequest;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateRatingRequest {
    String content;
    Integer rating;
}
