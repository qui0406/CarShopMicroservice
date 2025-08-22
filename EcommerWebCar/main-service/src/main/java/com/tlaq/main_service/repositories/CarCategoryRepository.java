package com.tlaq.main_service.repositories;

import com.tlaq.main_service.entity.CarCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CarCategoryRepository  extends JpaRepository<CarCategory,Long> {
}
