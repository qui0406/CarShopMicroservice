package com.tlaq.cms_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RatingResponse {
    Long id;
    String content;
    Integer rating;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    Profile profile;
    Car car;

    public static class Profile {
        String id;
        String username;
        String avatar;
    }

    public static class Car {
        String id;
        String name;
    }
}
