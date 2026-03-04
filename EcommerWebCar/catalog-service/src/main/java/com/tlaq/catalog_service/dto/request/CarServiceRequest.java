package com.tlaq.catalog_service.dto.request;

import jakarta.validation.constraints.Min;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CarServiceRequest {
    String dongCo;
    String hopSo;

    @Min(value = 0, message = "Công suất không được âm")
    BigDecimal congSuat;

    @Min(value = 0, message = "Mô-men xoắn không được âm")
    BigDecimal momenXoan;

    BigDecimal dungTichXiLanh;
    BigDecimal dungTichXang;
    BigDecimal taiTrong;
    BigDecimal chieuDai;
    String mauSac;
    BigDecimal tocDoToiDa;
    String loaiNhienLieu;
}