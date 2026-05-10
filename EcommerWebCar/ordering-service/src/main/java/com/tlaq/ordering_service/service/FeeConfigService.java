package com.tlaq.ordering_service.service;

import java.math.BigDecimal;

public interface FeeConfigService {

    /** Lấy giá trị phí theo key (dành cho phí toàn quốc, region = ALL) */
    BigDecimal get(String key);

    /** Lấy phí theo key + region cụ thể (HANOI, HCM, OTHER) */
    BigDecimal getByRegion(String key, String region);

    /**
     * Lấy tỷ lệ thuế trước bạ theo địa chỉ và loại nhiên liệu.
     * Trả về BigDecimal.ZERO nếu xe điện (miễn thuế).
     */
    BigDecimal getRegistrationTaxRate(String region, String fuelType);

    /** Lấy phí biển số theo vùng */
    BigDecimal getPlateFee(String region);

    /** Lấy phí đăng kiểm (áp dụng toàn quốc) */
    BigDecimal getInspectionFee();

    /**
     * Chuyển địa chỉ văn bản sang mã region chuẩn.
     * Ví dụ: "Hà Nội" -> "HANOI", "Hồ Chí Minh" -> "HCM", khác -> "OTHER"
     */
    String resolveRegion(String address);
}
