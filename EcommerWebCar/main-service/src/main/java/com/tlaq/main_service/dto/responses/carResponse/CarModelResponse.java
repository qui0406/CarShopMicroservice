package com.tlaq.main_service.dto.responses.carResponse;

import com.tlaq.main_service.entity.CarCategory;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CarModelResponse {
    Long id;
    String name;
    String category;
    String brand;
}
