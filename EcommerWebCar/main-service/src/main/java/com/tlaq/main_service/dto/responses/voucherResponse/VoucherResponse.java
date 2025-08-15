package com.tlaq.main_service.dto.responses.voucherResponse;

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
