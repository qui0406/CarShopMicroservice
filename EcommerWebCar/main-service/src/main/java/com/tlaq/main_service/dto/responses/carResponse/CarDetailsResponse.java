package com.tlaq.main_service.dto.responses.carResponse;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CarDetailsResponse {
    String id;
    String name;
    BigDecimal price;
    LocalDate year;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    String carBranch;
    String carModel;
    CarFeatureResponse carFeature;
    CarServiceResponse carService;
    List<String> images;
}
