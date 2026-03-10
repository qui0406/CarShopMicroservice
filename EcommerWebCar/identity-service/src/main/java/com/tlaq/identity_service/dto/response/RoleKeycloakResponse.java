package com.tlaq.identity_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoleKeycloakResponse {
    String id;
    String name;
    String description;
    boolean composite;
    boolean clientRole;
    String containerId;
}