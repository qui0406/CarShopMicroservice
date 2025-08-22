package com.tlaq.main_service.repositories;

import com.tlaq.main_service.entity.CarBranch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CarBranchRepository extends JpaRepository<CarBranch,Long> {
}
