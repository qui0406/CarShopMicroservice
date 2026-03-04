package com.tlaq.catalog_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
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