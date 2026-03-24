package com.tlaq.cms_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VoucherResponse {
    String id;
    String title;
    String description;
    String content;
    LocalDateTime createdDateTime;
    LocalDateTime endDateTime;
}
