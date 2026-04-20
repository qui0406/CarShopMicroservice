package com.tlaq.catalog_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Model3DResponse {
    String carId;
    String model3dUrl;
}
