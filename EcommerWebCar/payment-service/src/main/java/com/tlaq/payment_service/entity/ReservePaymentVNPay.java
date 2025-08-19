package com.tlaq.payment_service.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@NoArgsConstructor
@AllArgsConstructor
@Entity
@SuperBuilder
@PrimaryKeyJoinColumn
@Data
@Table(name = "reserve_payment_vnpay")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReservePaymentVNPay extends  Payment {
    @Column(name = "transaction_id")
    String transactionVNPayId;

    @Column(name = "disposit_amount")
    BigDecimal depositAmount;

    @Column(name ="remaining_amount")
    BigDecimal remainingAmount;

    boolean active;
}
