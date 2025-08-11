package com.tlaq.main_service.dto.responses.carResponse;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CarResponse {
     String id;
     String name;
     LocalDate year;
     CarTypeResponse carType;
     CarFeatureResponse carFeature;
     CarServiceResponse carService;
     List<CarImageResponse> carImage;
}
