package com.tlaq.main_service.dto.requests.carRequest;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CarComfortRequest {
    boolean mayDieuHoa;
    String manHinh;
    String ghe;
    boolean sacKhongDay;
    boolean copDien;
    String cuaSo;
    boolean bluetooth;
    String loa;
    boolean gps;
}
