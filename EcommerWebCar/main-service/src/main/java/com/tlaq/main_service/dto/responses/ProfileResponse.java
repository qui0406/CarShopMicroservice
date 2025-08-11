package com.tlaq.main_service.dto.responses;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProfileResponse {
    String id;
    String userKeyCloakId;
    String email;
    String username;
    String firstName;
    String lastName;
    String phone;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    LocalDate dob;
    String address;
    String avatar;
}
