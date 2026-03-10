package com.tlaq.catalog_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EquipmentResponse {
    Long id;

    // Tiện nghi [cite: 2026-01-26, 2026-03-09]
    boolean hasAirConditioning;
    String screenType;
    String seatMaterial;
    String speakerSystem;
    String sunRoof;
    boolean wirelessCharge;
    boolean electricTrunk;
    boolean hasBluetooth;
    boolean hasGps;

    // Ngoại thất & An toàn [cite: 2026-03-05, 2026-03-09]
    String headlampType;
    boolean smartKey;
    boolean electricMirror;
    boolean hasAirbags;
    boolean electronicStability;
    boolean laneKeepAssist;
    boolean hasCamera;
    boolean parkingSensor;
}
