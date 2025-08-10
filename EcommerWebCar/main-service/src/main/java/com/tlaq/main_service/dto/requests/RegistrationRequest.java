package com.tlaq.main_service.dto.requests;

//import com.tlaq.auth.validator.DobConstraint;
import com.tlaq.main_service.validators.DobConstraint;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RegistrationRequest {
    @Size(min = 4, message = "USERNAME_INVALID")
    String username;

    @Size(min = 6, message = "INVALID_PASSWORD")
    String password;

    @Email(message = "INVALID_EMAIL")
    @NotBlank(message = "EMAIL_IS_REQUIRED")
    String email;

    String firstName;
    String lastName;
    String address;
    boolean sex;
    String phone;

    MultipartFile avatar;
    @DobConstraint(min = 10, message = "INVALID_DOB")
    LocalDate dob;

}
