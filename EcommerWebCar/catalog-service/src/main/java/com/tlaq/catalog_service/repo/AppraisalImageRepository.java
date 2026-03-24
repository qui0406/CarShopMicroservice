package com.tlaq.catalog_service.repo;

import com.tlaq.catalog_service.entity.AppraisalImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppraisalImageRepository extends JpaRepository<AppraisalImage, Long> {

    // Lấy tất cả ảnh của một yêu cầu định giá cụ thể
    List<AppraisalImage> findByAppraisalRequestId(String appraisalRequestId);

    // Xóa tất cả ảnh khi yêu cầu bị hủy (nếu cần dọn dẹp DB)
    void deleteByAppraisalRequestId(String appraisalRequestId);
}