package com.tlaq.main_service.entity;

import com.tlaq.main_service.entity.enums.PaymentStatus;
import com.tlaq.main_service.entity.enums.RoleCreateOrder;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name="orders")
public class Orders {
    @Id
    String id;

    @Enumerated(EnumType.STRING)
    PaymentStatus paymentStatus;

    @JoinColumn(name = "profile_id", referencedColumnName = "id")
    @ManyToOne
    Profile profile;

    @JoinColumn(name = "car_id", referencedColumnName = "id")
    @ManyToOne
    Car car;

    @JoinColumn(name = "order_details_id", referencedColumnName = "id")
    @OneToOne(cascade = CascadeType.ALL)
    OrderDetails orderDetails;

    @CreationTimestamp
    LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    RoleCreateOrder roleCreateOrder;
}
