package com.tlaq.catalog_service.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CarResponse {
    String id;
    CarModelResponse carModel;
    String thumbnail;
    String name;

    String vinNumber;
    String color;
    BigDecimal price;
    int manufacturingYear;
    String fuelType;
    String description;

    // Dành cho xe cũ
    boolean isUsed;
    int mileage;
    String inspectionReportUrl;

    String model3dUrl;
    List<String> imageUrls;

    @JsonProperty("isReady")
    boolean isReady;

    @JsonProperty("isDeposited")
    boolean deposited;

    @JsonProperty("isSold")
    boolean sold;

    TechSpecResponse technicalSpec;
    EquipmentResponse equipment;

    String showRoomId;
    String showRoomName;

    LocalDateTime updatedAt;
}
