package com.tlaq.catalog_service.repo;

import com.tlaq.catalog_service.entity.ShowRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShowRoomRepository extends JpaRepository<ShowRoom, String> {
    // Tìm showroom theo chủ sở hữu (ownerId từ Identity Service) [cite: 2026-02-25]
    ShowRoom findByOwnerId(String ownerId);

    ShowRoom existsShowRoomByOwnerId(String ownerId);
}