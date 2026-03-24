package com.tlaq.ordering_service.dto.message;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class InventoryUpdateMessage {
    String carId;
    int quantity;
}