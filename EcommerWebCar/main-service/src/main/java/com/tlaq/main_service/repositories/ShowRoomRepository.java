package com.tlaq.main_service.repositories;

import com.tlaq.main_service.entity.ShowRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ShowRoomRepository  extends JpaRepository<ShowRoom, String> {
    boolean existsShowRoomByOwnerId(String profileId);

    Optional<ShowRoom> findByOwnerId(String ownerId);
}
