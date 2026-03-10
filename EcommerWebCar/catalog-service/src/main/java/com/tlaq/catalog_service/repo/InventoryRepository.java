package com.tlaq.catalog_service.repo;

import com.tlaq.catalog_service.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, String> {
    Optional<Inventory> findByCarId(String carId);

    List<Inventory> findByShowRoomId(String showRoomId);

    Optional<Inventory> findInventoryByCarId(String id);

    boolean existsByCarId(String carId);

    boolean existsByCarIdAndQuantityGreaterThanEqual(String carId, int quantity);

    Optional<Inventory> findByCarIdAndShowRoomId(String carId, String showRoomId);
}