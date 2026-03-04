package com.tlaq.catalog_service.repo;

import com.tlaq.catalog_service.entity.CarSpecification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CarSpecificationRepository extends JpaRepository<CarSpecification, Long> {}