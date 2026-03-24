package com.tlaq.catalog_service.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EquipmentRequest {
    // Tiện nghi nội thất [cite: 2026-01-26, 2026-03-09]
    boolean hasAirConditioning;
    String screenType;
    String seatMaterial;
    String speakerSystem;
    boolean wirelessCharge;
    boolean electricTrunk;

    // Kết nối & Ngoại thất [cite: 2026-01-26, 2026-03-09]
    boolean hasBluetooth;
    boolean hasGps;
    String headlampType;
    boolean smartKey;

    // An toàn [cite: 2026-03-05, 2026-03-09]
    boolean hasAirbags;
    boolean electronicStability;
    boolean laneKeepAssist;
    boolean hasCamera;
    boolean parkingSensor;
}
