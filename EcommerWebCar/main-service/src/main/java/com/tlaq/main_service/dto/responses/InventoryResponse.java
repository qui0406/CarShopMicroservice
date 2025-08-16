package com.tlaq.main_service.dto.responses;

import com.tlaq.main_service.entity.Car;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class InventoryResponse {
    String id;
    int quantity;
    LocalDateTime createdAt;
    Car car;

    @Data
    @Builder
    public static class Car {
        String id;
        String name;
    }
}
