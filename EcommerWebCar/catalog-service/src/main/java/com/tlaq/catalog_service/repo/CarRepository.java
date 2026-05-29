package com.tlaq.catalog_service.repo;

import com.tlaq.catalog_service.entity.Car;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import jakarta.transaction.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface CarRepository extends JpaRepository<Car, String>, JpaSpecificationExecutor<Car> {
    List<Car> findByIsUsed(boolean isUsed);

    List<Car> findByCarModelId(Long carModelId);

    List<Car> findByPriceBetween(BigDecimal minPrice, BigDecimal maxPrice);

    @Query("SELECT c FROM Car c WHERE c.isReady = :isReady AND c.isUsed = :isUsed AND c.deposited = false AND c.sold = false")
    Page<Car> findByIsReadyAndIsUsed(boolean isReady, boolean isUsed, Pageable pageable);

    @Modifying(clearAutomatically = true)
    @Transactional
    @Query("UPDATE Car c SET c.deposited = true WHERE c.id = :carId AND c.deposited = false AND c.sold = false AND c.isReady = true AND c.deleted = false")
    int markAsDeposited(@org.springframework.data.repository.query.Param("carId") String carId);

    @Modifying(clearAutomatically = true)
    @Transactional
    @Query("UPDATE Car c SET c.deposited = false WHERE c.id = :carId AND c.deposited = true")
    int unmarkDeposited(@org.springframework.data.repository.query.Param("carId") String carId);

    @Modifying(clearAutomatically = true)
    @Transactional
    @Query("UPDATE Car c SET c.sold = true WHERE c.id = :carId AND c.deposited = true AND c.sold = false")
    int markAsSold(@org.springframework.data.repository.query.Param("carId") String carId);
}
