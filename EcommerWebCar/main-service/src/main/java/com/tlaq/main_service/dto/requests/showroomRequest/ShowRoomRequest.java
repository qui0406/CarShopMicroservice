package com.tlaq.main_service.dto.requests.showroomRequest;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ShowRoomRequest {
    String name;
    String address;
    String phone;
    String email;
    String zalo;
    String facebook;
    BigDecimal latitude;
    BigDecimal longitude;
    String profileId;
}
