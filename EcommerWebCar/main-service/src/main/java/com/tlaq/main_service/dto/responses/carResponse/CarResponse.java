package com.tlaq.main_service.dto.responses.carResponse;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CarResponse {
     String id;
     String name;
     LocalDate year;
     LocalDateTime createdAt;
     LocalDateTime updatedAt;
     CarTypeResponse carType;
     CarFeatureResponse carFeature;
     CarServiceResponse carService;
     List<String> carImage;
}
