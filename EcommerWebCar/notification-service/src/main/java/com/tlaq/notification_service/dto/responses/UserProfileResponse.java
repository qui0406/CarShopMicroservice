package com.tlaq.notification_service.dto.responses;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserProfileResponse {
    String id;
    String userKeyCloakId;
    String username;
    String email;
    String firstName;
    String lastName;
    LocalDate dob;
    boolean sex;
    String avatar;
}
