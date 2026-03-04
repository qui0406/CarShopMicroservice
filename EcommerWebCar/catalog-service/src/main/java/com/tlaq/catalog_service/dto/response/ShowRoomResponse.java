package com.tlaq.catalog_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ShowRoomResponse {
    String id;
    String name;
    String address;
    String phone;
    String email;
    BigDecimal longitude;
    BigDecimal latitude;
    String zalo;
    String facebook;
    String about;
    String description;

    // ID chủ sở hữu để Frontend có thể gọi tiếp API lấy thông tin Profile
    String ownerId;

    // Danh sách URL hình ảnh của Showroom
    List<String> images;

    LocalDateTime createdAt;
}