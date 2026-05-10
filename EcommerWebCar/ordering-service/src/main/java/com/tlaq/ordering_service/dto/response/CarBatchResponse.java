package com.tlaq.ordering_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CarBatchResponse {
    CarResponse carDetail;
    boolean inStock;
}
