package com.tlaq.main_service.dto.requests.voucherRequest;

import com.tlaq.main_service.validators.DateTimeConstraint;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@DateTimeConstraint(startField = "createdAt", endField = "expiredAt")
public class VoucherRequest {
    String description;
    String title;
    String content;
    LocalDateTime createdDateTime;
    LocalDateTime endDateTime;
}
