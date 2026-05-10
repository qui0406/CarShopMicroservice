package com.tlaq.catalog_service.dto.request;

import jakarta.validation.constraints.Min;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CarFilterRequest {
    String branch;
    boolean isUsed;

    @Min(value = 1, message = "Page phải lớn hơn 0")
    int page = 1;

    @Min(value = 1, message = "Size phải lớn hơn 0")
    int size = 10;
}
