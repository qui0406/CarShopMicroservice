package com.tlaq.main_service.repositories;

import com.tlaq.main_service.entity.CarImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CarImageRepository extends JpaRepository<CarImage,Long> {
    List<CarImage> findByCarId(String carId);
}
