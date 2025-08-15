package com.tlaq.main_service.dto.responses.showroomResponse;

import com.tlaq.main_service.entity.Profile;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ShowRoomResponse {
    String id;
    String name;
    String address;
    String phone;
    String email;
    String zalo;
    String facebook;
    BigDecimal latitude;
    BigDecimal longitude;
    Profile owner;
    List<String> images;

    @Data
    public static class Profile {
        private String id;
        private String username;
        private String firstname;
        private String lastname;
        private String email;
    }
}
