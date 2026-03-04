package com.tlaq.cms_service.repo;

import com.tlaq.main_service.entity.News;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NewsRepository extends JpaRepository<News, Long> {
}
