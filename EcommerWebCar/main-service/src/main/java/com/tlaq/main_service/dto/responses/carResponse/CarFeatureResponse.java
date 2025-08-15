package com.tlaq.main_service.dto.responses.carResponse;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CarFeatureResponse {
    Long id;
    String mayDieuHoa;
    String manHinh;
    String ghe;
    boolean sacKhongDay;
    boolean copDien;
    String cuaSo;
    String hoTroPhanh;
    boolean bluetooth;
    boolean camera;
    String phanhKhanCap;
    boolean hoTroGiuLan;
}
