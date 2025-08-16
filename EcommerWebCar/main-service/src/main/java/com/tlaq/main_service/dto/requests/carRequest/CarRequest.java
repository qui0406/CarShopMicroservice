package com.tlaq.main_service.dto.requests.carRequest;

import com.tlaq.main_service.entity.CarImage;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CarRequest {
     String name;
     LocalDate year;
     Long carTypeId;
     BigDecimal price;
     CarFeatureRequest carFeature;
     CarServiceRequest carService;
}
