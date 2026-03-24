package com.tlaq.identity_service.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class KeyCloak {
    String serverUrl;
    String realm;
    String grantType;
    String clientId;
    String clientSecret;
}
