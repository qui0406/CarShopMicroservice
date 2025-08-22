package com.tlaq.main_service.dto.requests.carRequest;

import com.tlaq.main_service.entity.enums.Phanh;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FeatureSafetyRequest {
    boolean tuiKhi;
    Phanh phanh;
    boolean canBangDienTu;
    boolean hoTroGiuLan;
    boolean camera;
    boolean camBienDoXe;
}
