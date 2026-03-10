package com.tlaq.catalog_service.repo;

import com.tlaq.catalog_service.entity.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CarSpecificationRepository extends JpaRepository<Equipment, Long> {}