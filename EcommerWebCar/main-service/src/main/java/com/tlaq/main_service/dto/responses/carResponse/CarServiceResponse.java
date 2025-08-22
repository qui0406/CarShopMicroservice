package com.tlaq.main_service.dto.responses.carResponse;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CarServiceResponse {
    Long id;
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
