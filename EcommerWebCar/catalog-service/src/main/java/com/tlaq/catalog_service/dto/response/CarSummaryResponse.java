package com.tlaq.catalog_service.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CarSummaryResponse {
    String id;
    String name;
    String thumbnail;

    int seatCapacity;
    String fuelType;
    String engineSize;

    BigDecimal price;
    
    @JsonProperty("isReady")
    boolean isReady;

    @JsonProperty("isDeposited")
    boolean deposited;

    @JsonProperty("isSold")
    boolean sold;

    Integer quantity; // Optional field for staff views
}
