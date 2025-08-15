package com.tlaq.repository;

import com.tlaq.entity.FraudRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FraudRecordRepository extends JpaRepository<FraudRecord, Long> {
    Optional<FraudRecord> findByCustomerId(Integer customerId);
}
