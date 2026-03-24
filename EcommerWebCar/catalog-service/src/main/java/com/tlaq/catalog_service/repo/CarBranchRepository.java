package com.tlaq.catalog_service.repo;

import com.tlaq.catalog_service.entity.CarBranch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CarBranchRepository extends JpaRepository<CarBranch,Long> {
}
