package com.tlaq.main_service.dto.responses.carResponse;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CarServiceResponse {
    Long id;
    String dongCo;
    String hopSo;
    Double congSuat;
    Double momenXoan;
    Double dungTichXiLanh;
    Double dungTichXang;
    Double taiTrong;
    Double chieuDai;
    String mauSac;
    Double tocDoToiDa;
    String loaiNhienLieu;
}
