package com.tlaq.catalog_service.repo;

import com.tlaq.catalog_service.entity.TechnicalSpec;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CarServiceRepository extends JpaRepository<TechnicalSpec, Long> {}