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
public class ListCarStaffResponse {
    String id;
    String vinNumber;
    String carName;
    String carBranch;
    String category;
    int year;
    BigDecimal price;
    int quantity;
    @JsonProperty("isReady")
    boolean isReady;

    @JsonProperty("isDeposited")
    boolean deposited;

    @JsonProperty("isSold")
    boolean sold;
}
