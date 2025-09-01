package com.tlaq.main_service.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name="order_details")
public class OrderDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    String address;
    String fullName;
    LocalDate dob;
    String cccd;
    String phoneNumber;

    @Column(name = "unit_price")
    BigDecimal unitPrice;

    int quantity;

    @Column(name ="total_amount")
    BigDecimal totalAmount;


}
