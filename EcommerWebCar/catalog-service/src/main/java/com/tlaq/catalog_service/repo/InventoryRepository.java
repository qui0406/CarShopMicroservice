package com.tlaq.catalog_service.repo;

import com.tlaq.catalog_service.entity.Inventory;
import jakarta.persistence.LockModeType;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, String> {
    Optional<Inventory> findInventoryByCarId(String id);

    Optional<Inventory> findByCarIdAndShowRoomId(String carId, String showRoomId);

    @Query("SELECT i.quantity FROM Inventory i WHERE i.carId = :carId")
    Optional<Integer> findQuantityByCarId(String carId);

    @Modifying(clearAutomatically = true)
    @Transactional
    @Query("UPDATE Inventory i SET i.quantity = i.quantity - :qty WHERE i.carId = :carId AND i.quantity >= :qty")
    int deduceStock(String carId, int qty);
}