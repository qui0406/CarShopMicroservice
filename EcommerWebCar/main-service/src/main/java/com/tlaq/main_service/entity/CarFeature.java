package com.tlaq.main_service.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name="car_feature")
public class CarFeature {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;
    String mayDieuHoa;
    String manHinh;
    String ghe;
    boolean sacKhongDay;
    boolean copDien;
    String cuaSo;
    String hoTroPhanh;
    boolean bluetooth;
    boolean camera;
    String phanhKhanCap;
    boolean hoTroGiuLan;
}
