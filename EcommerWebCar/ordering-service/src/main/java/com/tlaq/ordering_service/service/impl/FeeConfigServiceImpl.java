package com.tlaq.ordering_service.service.impl;

import com.tlaq.ordering_service.entity.FeeConfig;
import com.tlaq.ordering_service.exceptions.AppException;
import com.tlaq.ordering_service.exceptions.ErrorCode;
import com.tlaq.ordering_service.repo.FeeConfigRepository;
import com.tlaq.ordering_service.service.FeeConfigService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FeeConfigServiceImpl implements FeeConfigService {

    static final String KEY_TAX_RATE   = "REGISTRATION_TAX_RATE";
    static final String KEY_PLATE_FEE  = "PLATE_FEE";
    static final String KEY_INSPECTION = "INSPECTION_FEE";

    static final String REGION_HANOI = "HANOI";
    static final String REGION_HCM   = "HCM";
    static final String REGION_OTHER = "OTHER";
    static final String REGION_ALL   = "ALL";

    static final String FUEL_ALL      = "ALL";
    static final String FUEL_ELECTRIC = "ELECTRIC";

    FeeConfigRepository feeConfigRepository;

    // -----------------------------------------------------------------------
    // Public API
    // -----------------------------------------------------------------------

    @Override
    public BigDecimal get(String key) {
        return feeConfigRepository.findByKeyAndActiveTrue(key)
                .map(FeeConfig::getValue)
                .orElseThrow(() -> new AppException(ErrorCode.FEE_CONFIG_NOT_FOUND));
    }

    @Override
    public BigDecimal getByRegion(String key, String region) {
        return feeConfigRepository.findByKeyAndRegionAndActiveTrue(key, region)
                .map(FeeConfig::getValue)
                .orElseThrow(() -> {
                    log.error("Fee config not found: key={}, region={}", key, region);
                    return new AppException(ErrorCode.FEE_CONFIG_NOT_FOUND);
                });
    }

    /**
     * Trả về BigDecimal.ZERO cho xe điện (miễn thuế trước bạ).
     * Với xe thường, tìm tỷ lệ theo region + fuel_type=ALL trong DB.
     */
    @Override
    public BigDecimal getRegistrationTaxRate(String region, String fuelType) {
        if (FUEL_ELECTRIC.equalsIgnoreCase(fuelType)) {
            return BigDecimal.ZERO;
        }
        return feeConfigRepository
                .findByKeyAndRegionAndFuelTypeAndActiveTrue(KEY_TAX_RATE, region, FUEL_ALL)
                .map(FeeConfig::getValue)
                .orElseThrow(() -> {
                    log.error("Registration tax rate not found: region={}, fuelType={}", region, fuelType);
                    return new AppException(ErrorCode.FEE_CONFIG_NOT_FOUND);
                });
    }

    @Override
    public BigDecimal getPlateFee(String region) {
        return feeConfigRepository
                .findByKeyAndRegionAndActiveTrue(KEY_PLATE_FEE, region)
                .map(FeeConfig::getValue)
                .orElseThrow(() -> {
                    log.error("Plate fee not found: region={}", region);
                    return new AppException(ErrorCode.FEE_CONFIG_NOT_FOUND);
                });
    }

    @Override
    public BigDecimal getInspectionFee() {
        return feeConfigRepository
                .findByKeyAndRegionAndActiveTrue(KEY_INSPECTION, REGION_ALL)
                .map(FeeConfig::getValue)
                .orElseThrow(() -> new AppException(ErrorCode.FEE_CONFIG_NOT_FOUND));
    }

    /**
     * Chuyển địa chỉ tự do sang mã region chuẩn (HANOI / HCM / OTHER).
     *
     * <p>Xử lý: bỏ dấu Unicode, lower-case, kiểm tra từ khóa.
     * Ví dụ:
     * <pre>
     *   "Quận 1, TP.HCM"  -> HCM
     *   "Hà Nội"           -> HANOI
     *   "hà nội"           -> HANOI
     *   "HA NOI"            -> HANOI
     *   "Huế"              -> OTHER
     * </pre>
     */
    @Override
    public String resolveRegion(String address) {
        if (address == null || address.isBlank()) return REGION_OTHER;
        String normalized = stripAccents(address).toLowerCase();
        if (normalized.contains("ha noi") || normalized.contains("hanoi")) {
            return REGION_HANOI;
        }
        if (normalized.contains("ho chi minh") || normalized.contains("hochiminh")
                || normalized.contains("hcm") || normalized.contains("tphcm")
                || normalized.contains("tp.hcm") || normalized.contains("tp. hcm")) {
            return REGION_HCM;
        }
        return REGION_OTHER;
    }

    // -----------------------------------------------------------------------
    // Helper
    // -----------------------------------------------------------------------

    private static String stripAccents(String input) {
        String nfd = Normalizer.normalize(input, Normalizer.Form.NFD);
        return Pattern.compile("\\p{InCombiningDiacriticalMarks}+").matcher(nfd).replaceAll("");
    }
}
