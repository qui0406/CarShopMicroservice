package com.tlaq.payment_service.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

@NoArgsConstructor
@AllArgsConstructor
@Entity
@Data
@SuperBuilder
@Table(name = "cash_payment")
@PrimaryKeyJoinColumn
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CashierPayment extends Payment {
    @Column(name= "staff_id")
    String staffId;

    @Column(name = "receipt_number")
    String receiptNumber;
}
