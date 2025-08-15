package com.tlaq.main_service.repositories;

import com.tlaq.main_service.entity.CarFeature;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CarFeatureRepository extends JpaRepository<CarFeature,Long> {
}
