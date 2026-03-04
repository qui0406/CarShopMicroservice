package com.tlaq.catalog_service.repo;

import com.tlaq.catalog_service.entity.AppraisalRequest;
import com.tlaq.catalog_service.entity.enums.AppraisalStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppraisalRequestRepository extends JpaRepository<AppraisalRequest, String>, JpaSpecificationExecutor<AppraisalRequest> {

    // Tìm tất cả yêu cầu của một User cụ thể (để khách xem lịch sử bán xe của họ)
    List<AppraisalRequest> findByUserIdOrderByCreatedAtDesc(String userId);

    // Lọc danh sách yêu cầu theo trạng thái (Cho Admin Showroom xử lý)
    Page<AppraisalRequest> findByStatus(AppraisalStatus status, Pageable pageable);

    // Thống kê: Đếm số lượng yêu cầu đang chờ xử lý (PENDING)
    long countByStatus(AppraisalStatus status);

    // Tìm các yêu cầu định giá theo Hãng xe (Branch)
    List<AppraisalRequest> findByBranchId(Long branchId);


}