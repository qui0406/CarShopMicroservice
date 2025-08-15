package com.tlaq.main_service.dto.requests.carRequest;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CarServiceRequest {
    String dongCo;
    String hopSo;
    BigDecimal congSuat;
    BigDecimal momenXoan;
    BigDecimal dungTichXiLanh;
    BigDecimal dungTichXang;
    BigDecimal taiTrong;
    BigDecimal chieuDai;
    String mauSac;
    BigDecimal tocDoToiDa;
    String loaiNhienLieu;
}
