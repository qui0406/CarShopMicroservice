package com.tlaq.catalog_service.repo;

import com.tlaq.catalog_service.entity.Car;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface CarRepository extends JpaRepository<Car, String>, JpaSpecificationExecutor<Car> {
    List<Car> findByIsUsed(boolean isUsed);

    List<Car> findByCarModelId(Long carModelId);

    List<Car> findByPriceBetween(BigDecimal minPrice, BigDecimal maxPrice);
}
