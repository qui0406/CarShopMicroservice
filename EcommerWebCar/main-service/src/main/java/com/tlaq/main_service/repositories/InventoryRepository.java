package com.tlaq.main_service.repositories;

import com.tlaq.main_service.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;


public interface InventoryRepository extends JpaRepository<Inventory, String> {
    Optional<Inventory> findInventoryByCarId(String id);

    boolean existsByCarId(String carId);

    boolean existsByCarIdAndQuantityGreaterThanEqual(String carId, int quantity);
}
