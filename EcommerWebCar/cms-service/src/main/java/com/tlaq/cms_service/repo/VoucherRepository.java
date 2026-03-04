package com.tlaq.cms_service.repo;

import com.tlaq.main_service.entity.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, Long> {
    List<Voucher> findAllVouchersByShowRoomId(String showroomId);
}
