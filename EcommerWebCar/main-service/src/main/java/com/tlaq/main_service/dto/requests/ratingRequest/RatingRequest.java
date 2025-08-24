package com.tlaq.main_service.dto.requests.ratingRequest;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RatingRequest {
    String content;

    @Min(value = 1)
    @Max(value = 5)
    Integer rating;

    String profileId;
    String carId;
}
