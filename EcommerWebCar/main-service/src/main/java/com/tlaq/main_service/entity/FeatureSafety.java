package com.tlaq.main_service.entity;

import com.tlaq.main_service.entity.enums.Phanh;
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
@Table(name="feature_safety")
public class FeatureSafety {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Builder.Default
    boolean tuiKhi= true;
    Phanh phanh;

    @Builder.Default
    boolean canBangDienTu= true;

    @Builder.Default
    boolean hoTroGiuLan= true;

    @Builder.Default
    boolean camera= true;

    @Builder.Default
    boolean camBienDoXe= true;
}
