package com.tlaq.catalog_service.repo;

import com.tlaq.catalog_service.entity.CarModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CarModelRepository extends JpaRepository<CarModel, Long> {
    List<CarModel> findByCarBranchId(Long branchId);

    List<CarModel> findByCategoryId(Long categoryId);
}