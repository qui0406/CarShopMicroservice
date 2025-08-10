package com.tlaq.main_service.dto.requests;

import java.time.LocalDate;
import java.util.List;


import com.tlaq.main_service.validators.DobConstraint;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.web.multipart.MultipartFile;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserUpdateRequest {
    String password;
    String firstName;
    String lastName;

    @DobConstraint(min = 18, message = "INVALID_DOB")
    LocalDate dob;
    MultipartFile avatar;

    List<Integer> roles;
}
