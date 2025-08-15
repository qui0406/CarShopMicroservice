package com.tlaq.main_service.repositories;

import com.tlaq.main_service.entity.CarService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CarServiceRepository extends JpaRepository<CarService,Long> {

}
