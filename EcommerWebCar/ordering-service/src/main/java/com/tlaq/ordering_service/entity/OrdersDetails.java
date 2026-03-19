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
// OrdersDetails.java — bỏ totalAmount (computed), bỏ orders object (chỉ giữ FK qua @ManyToOne)
@Entity
@Table(name = "order_details")
public class OrdersDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    String address;
    String fullName;
    LocalDate dob;
    String cccd;
    String phoneNumber;

    @Column(name = "unit_price", nullable = false)
    BigDecimal unitPrice;

    @Column(nullable = false)
    int quantity;

    @Column(name = "car_id", nullable = false)
    String carId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    Orders order;
}