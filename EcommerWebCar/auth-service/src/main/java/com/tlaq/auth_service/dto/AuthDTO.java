package com.tlaq.auth_service.dto;

import com.tlaq.auth_service.dto.requests.IntrospectRequest;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AuthDTO {
    private String id;
    private String username;
    private String password;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private LocalDate dob;
    private boolean sex;
    private String avt;
    private Boolean isAuthenticated;
    private IntrospectRequest tokenDTO;
}
