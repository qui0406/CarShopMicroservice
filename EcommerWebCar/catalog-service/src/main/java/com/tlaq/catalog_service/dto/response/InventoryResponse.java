package com.tlaq.catalog_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class InventoryResponse {
    String id;
    int quantity;
    CarSummaryResponse car;
    ShowRoomSummaryResponse showRoom;
    LocalDateTime createdAt;

    @Data
    @Builder
    public static class CarSummaryResponse {
        String id;
        String name;
        BigDecimal price;
        boolean isUsed;
    }

    @Data
    @Builder
    public static class ShowRoomSummaryResponse {
        String id;
        String name;
        String address;
    }
}