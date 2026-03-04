package com.tlaq.catalog_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CarSpecificationResponse {
    Long id;

    // Tiện nghi
    boolean mayDieuHoa;
    String manHinh;
    String ghe;
    boolean sacKhongDay;
    boolean copDien;
    String cuaSo;
    boolean bluetooth;
    String loa;
    boolean gps;

    // Ngoại thất
    String den;
    String gatMua;
    boolean smartKey;
    boolean guongDien;

    // An toàn
    boolean tuiKhi;
    String phanh;
    boolean canBangDienTu;
    boolean hoTroGiuLan;
    boolean camera;
    boolean camBienDoXe;
}
