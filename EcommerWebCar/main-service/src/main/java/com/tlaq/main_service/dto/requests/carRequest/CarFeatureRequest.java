package com.tlaq.main_service.dto.requests.carRequest;

import com.tlaq.main_service.entity.CarComfort;
import com.tlaq.main_service.entity.CarExterior;
import com.tlaq.main_service.entity.FeatureSafety;
import jakarta.persistence.CascadeType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CarFeatureRequest {
    CarComfortRequest carComfort;
    CarExteriorRequest carExterior;
    FeatureSafetyRequest featureSafety;
}
