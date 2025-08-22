package com.tlaq.main_service.entity;


import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name="car_model")
public class CarModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;
    String name;

    @JoinColumn(name = "category_id")
    @ManyToOne
    CarCategory category;

    @ManyToOne
    @JoinColumn(name = "car_branch_id", referencedColumnName = "id")
    CarBranch carBranch;
}
