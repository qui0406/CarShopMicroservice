package com.tlaq.catalog_service.repo;

import com.tlaq.catalog_service.entity.CarCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CarCategoryRepository  extends JpaRepository<CarCategory,Long> {
}
