package com.tlaq.main_service.repositories;

import com.tlaq.main_service.entity.CarType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CarTypeRepository extends JpaRepository<CarType, Long> {
    CarType findById(long id);
}
