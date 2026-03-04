package com.tlaq.ordering_service.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name="order_details")
public class OrdersDetails {
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

    @Column(name = "car_id", nullable = false)
    String carId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    Orders order;
}
