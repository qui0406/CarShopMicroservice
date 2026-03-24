package com.tlaq.catalog_service.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name="equipment")
public class Equipment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    // --- Nhóm Nội thất & Tiện nghi --- [cite: 2026-01-26, 2026-03-09]
    @Builder.Default
    boolean hasAirConditioning = true;
    String screenType;   // manHinh (Vd: OLED 12 inch)
    String seatMaterial; // ghe (Vd: Da Nappa, Nỉ)
    String speakerSystem;// loa (Vd: Burmester, Bose)
    String sunRoof;      // cuaSo (Vd: Toàn cảnh Panorama)

    @Builder.Default
    boolean wirelessCharge = true;
    @Builder.Default
    boolean electricTrunk = true;
    @Builder.Default
    boolean hasBluetooth = true;
    @Builder.Default
    boolean hasGps = true;

    // --- Nhóm Ngoại thất --- [cite: 2026-03-09]
    String headlampType; // den (Vd: LED Matrix, Halogen)
    String wiperType;    // gatMua (Vd: Tự động)

    @Builder.Default
    boolean smartKey = true;
    @Builder.Default
    boolean electricMirror = true;

    // --- Nhóm An toàn & Hỗ trợ lái --- [cite: 2026-03-05, 2026-03-09]
    String brakeType;    // phanh (Vd: Phanh đĩa ABS)
    @Builder.Default
    boolean hasAirbags = true;
    @Builder.Default
    boolean electronicStability = true; // canBangDienTu
    @Builder.Default
    boolean laneKeepAssist = true;      // hoTroGiuLan
    @Builder.Default
    boolean hasCamera = true;           // Camera 360/Lùi
    @Builder.Default
    boolean parkingSensor = true;       // camBienDoXe
}
