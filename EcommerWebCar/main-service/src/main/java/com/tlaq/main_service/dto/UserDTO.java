package com.tlaq.main_service.dto;

import com.tlaq.main_service.dto.responses.RoleResponse;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserDTO {
    String id;
    String username;
    String email;
    boolean emailVerified;
    String firstName;
    String lastName;
    String address;
    boolean sex;
    String phone;
    String avatar;
    LocalDate dob;
    Set<RoleResponse> roles;
}
