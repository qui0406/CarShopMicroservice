package com.tlaq.ordering_service.repo;

import com.tlaq.ordering_service.entity.FeeConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeeConfigRepository extends JpaRepository<FeeConfig, Long> {

    /** Tìm theo key và region chính xác (dùng cho PLATE_FEE, INSPECTION_FEE) */
    Optional<FeeConfig> findByKeyAndRegionAndActiveTrue(String key, String region);

    /** Tìm theo key, region và fuelType (dùng cho REGISTRATION_TAX_RATE) */
    Optional<FeeConfig> findByKeyAndRegionAndFuelTypeAndActiveTrue(String key, String region, String fuelType);

    /** Tìm theo key (dùng cho các phí toàn quốc region=ALL) */
    Optional<FeeConfig> findByKeyAndActiveTrue(String key);
}