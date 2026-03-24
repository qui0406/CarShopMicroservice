package com.tlaq.ordering_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EquipmentResponse {
    Integer id;
    boolean hasAirConditioning;
    String screenType;
    String seatMaterial;
    String speakerSystem;
    String sunRoof;
    boolean wirelessCharge;
    boolean electricTrunk;
    boolean hasBluetooth;
    boolean hasGps;
    String headlampType;
    boolean smartKey;
    boolean electricMirror;
    boolean hasAirbags;
    boolean electronicStability;
    boolean laneKeepAssist;
    boolean hasCamera;
    boolean parkingSensor;
}