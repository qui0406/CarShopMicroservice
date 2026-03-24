package com.tlaq.cms_service.repo;

import com.tlaq.main_service.entity.Rating;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Pageable;


@Repository
public interface RatingRepository extends JpaRepository<Rating,Long> {
    Page<Rating> findByCarId(String carId, Pageable pageable);
}
