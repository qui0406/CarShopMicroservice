package com.tlaq.catalog_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EquipmentResponse {
    boolean hasAirConditioning;
    String screenType;
    String seatMaterial;
    String speakerSystem;
    String sunRoof;
    boolean wirelessCharge;
    boolean electricTrunk;
    boolean hasBluetooth;
    String headlampType;
    boolean smartKey;
    boolean hasAirbags;
    boolean laneKeepAssist;
    boolean hasCamera;
}
