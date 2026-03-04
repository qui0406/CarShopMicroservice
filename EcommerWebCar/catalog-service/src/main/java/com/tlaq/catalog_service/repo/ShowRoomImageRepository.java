package com.tlaq.catalog_service.repo;

import com.tlaq.catalog_service.entity.ShowRoomImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ShowRoomImageRepository extends JpaRepository<ShowRoomImage, Long> {}