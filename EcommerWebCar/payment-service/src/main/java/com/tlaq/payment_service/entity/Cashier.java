package com.tlaq.payment_service.entity;

import com.tlaq.payment_service.entity.enums.PaymentMethod;
import com.tlaq.payment_service.entity.enums.PaymentStatus;
import com.tlaq.payment_service.entity.enums.PaymentType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Entity
@Data
@SuperBuilder
@Table(name = "cashier")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Cashier {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(name= "staff_id")
    String staffId;

    @OneToOne
    Deposit deposit;
}
