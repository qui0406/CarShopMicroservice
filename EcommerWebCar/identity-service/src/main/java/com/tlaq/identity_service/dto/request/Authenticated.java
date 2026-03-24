package com.tlaq.identity_service.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Authenticated {
    String client_id;
    String client_secret;
    String grant_type;
    String username;
    String password;
}
