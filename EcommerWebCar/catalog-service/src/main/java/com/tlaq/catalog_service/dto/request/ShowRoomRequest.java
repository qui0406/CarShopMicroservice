package com.tlaq.catalog_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ShowRoomRequest {
    @NotBlank(message = "Tên Showroom không được để trống")
    String name;

    @NotBlank(message = "Địa chỉ không được để trống")
    String address;

    String phone;
    String email;

    BigDecimal longitude;
    BigDecimal latitude;

    String zalo;
    String facebook;

    String about;
    String description;

    String ownerId;
}