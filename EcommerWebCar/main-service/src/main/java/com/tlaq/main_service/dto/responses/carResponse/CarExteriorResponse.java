package com.tlaq.main_service.dto.responses.carResponse;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CarExteriorResponse {
    Long id;
    String den;
    String gatMua;
    boolean smartKey;
    boolean guongDien;
}
