package com.tlaq.controller;

import com.tlaq.service.FraudDetectionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/fraud")
@RequiredArgsConstructor
@Slf4j
public class FraudDetectionController {

    @Autowired
    private FraudDetectionService fraudDetectionService;

    @GetMapping("/check/{customerId}")
    public ResponseEntity<Boolean> isFraudulentCustomer(@PathVariable Integer customerId) {
        boolean isFraudulent = fraudDetectionService.isFraudulentCustomer(customerId);
        return ResponseEntity.ok(isFraudulent);
    }

    @PostMapping("/record")
    public ResponseEntity<String> recordFraudCheck(
            @RequestParam Integer customerId,
            @RequestParam String transactionId,
            @RequestParam boolean isFraudulent) {
        fraudDetectionService.recordFraudCheck(customerId, transactionId, isFraudulent);
        return ResponseEntity.ok("Fraud check recorded successfully");
    }
}
