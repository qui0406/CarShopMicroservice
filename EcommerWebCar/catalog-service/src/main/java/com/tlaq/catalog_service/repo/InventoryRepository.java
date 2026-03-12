package com.tlaq.catalog_service.repo;

import com.tlaq.catalog_service.entity.Inventory;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
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

    @Query("SELECT i.quantity FROM Inventory i WHERE i.car.id = :carId")
    Optional<Integer> findQuantityByCarId(String carId);

    @Modifying(clearAutomatically = true)
    @Transactional
    @Query("UPDATE Inventory i SET i.quantity = i.quantity - :qty WHERE i.car.id = :carId")
    void reduceStock(String carId, int qty);
}