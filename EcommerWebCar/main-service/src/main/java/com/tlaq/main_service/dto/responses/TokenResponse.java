package com.tlaq.main_service.dto.responses;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TokenResponse {
    @JsonProperty("access_token")
    String accessToken;

    @JsonProperty("refresh_token")
    String refreshToken;

    @JsonProperty("expires_in")
    Long expiresIn;

    @JsonProperty("refresh_expires_in")
    Long refreshExpiresIn;

    @JsonProperty("token_type")
    String tokenType;

    @JsonProperty("scope")
    String scope;
}
