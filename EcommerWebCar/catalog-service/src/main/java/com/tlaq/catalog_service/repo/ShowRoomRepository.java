package com.tlaq.catalog_service.repo;

import com.tlaq.catalog_service.entity.ShowRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShowRoomRepository extends JpaRepository<ShowRoom, String> {
    @Query(value = "SELECT * FROM show_room LIMIT 1", nativeQuery = true)
    Optional<ShowRoom> findMainShowRoom();
}