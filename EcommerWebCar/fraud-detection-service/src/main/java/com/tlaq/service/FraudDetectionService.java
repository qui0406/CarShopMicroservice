package com.tlaq.service;

import com.tlaq.entity.FraudRecord;
import com.tlaq.repository.FraudRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class FraudDetectionService {
    @Autowired
    private FraudRecordRepository fraudRecordRepository;

    public boolean isFraudulentCustomer(Integer customerId) {
        // Logic phát hiện gian lận: Ví dụ, kiểm tra nếu khách hàng đã bị ghi nhận gian lận trước đó
        return fraudRecordRepository.findByCustomerId(customerId)
                .map(FraudRecord::isFraudulent)
                .orElse(false);
    }

    public FraudRecord recordFraudCheck(Integer customerId, String transactionId, boolean isFraudulent) {
        FraudRecord fraudRecord = new FraudRecord();
        fraudRecord.setCustomerId(customerId);
        fraudRecord.setTransactionId(transactionId);
        fraudRecord.setFraudulent(isFraudulent);
        fraudRecord.setTimestamp(LocalDateTime.now());
        return fraudRecordRepository.save(fraudRecord);
    }
}
