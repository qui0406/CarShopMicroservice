package com.tlaq.main_service.dto.responses.carResponse;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CarComfortResponse {
    Long id;
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
