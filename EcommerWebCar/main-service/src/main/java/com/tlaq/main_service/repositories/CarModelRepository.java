package com.tlaq.main_service.repositories;

import com.tlaq.main_service.entity.CarModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CarModelRepository extends JpaRepository<CarModel,Long> {

}
