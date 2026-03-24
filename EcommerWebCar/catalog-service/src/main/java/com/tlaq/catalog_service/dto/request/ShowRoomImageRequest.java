package com.tlaq.catalog_service.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ShowRoomImageRequest {
    String image;      // URL của ảnh
    String showRoomId; // ID của Showroom mà ảnh này thuộc về
}
