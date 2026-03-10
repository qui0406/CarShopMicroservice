package com.tlaq.identity_service.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StaffRegistrationRequest {
    String username;
    String password;
    String email;
    String firstName;
    String lastName;
}